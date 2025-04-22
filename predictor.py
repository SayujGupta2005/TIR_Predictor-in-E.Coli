import numpy as np
import joblib
import subprocess
import warnings
import os
warnings.filterwarnings("ignore")

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
model = joblib.load(os.path.join(MODEL_DIR, 'xgb_model.pkl'))
scaler2 = joblib.load(os.path.join(MODEL_DIR, 'scaler_base.pkl'))
scaler1 = joblib.load(os.path.join(MODEL_DIR, 'scaler_energy.pkl'))
pca = joblib.load(os.path.join(MODEL_DIR, 'pca_transform.pkl'))
# Thermodynamic energy feature labels
energy_labels = [
    'E40w65','E40w120','E40w20','E40w75','E40w35','E40w95','E40w45','E40w60','E40w80','E40w25',
    'E40w30','E40w90','E40w55','E40w110','E40w105','E40w85','E40w40','E40w100','E40w115','E40w50','E40w70'
]

# Matrix and nucleotide mapping for SD scoring
optimized_matrix = np.array([
    [0.37811828, 0.30360523, 0.34095191, 0.27888762, 0.35415697, 0.35875252],
    [0.16812464, 0.19013949, 0.00178932, 0.03994107, 0.01539302, 0.02543531],
    [0.27185748, 0.25643773, 0.50815593, 0.56792439, 0.53785519, 0.43253084],
    [0.15749042, 0.22540837, 0.12469366, 0.08883775, 0.06818564, 0.15887216]
])
nucleotide_to_index = {'A': 0, 'T': 1, 'G': 2, 'C': 3}

# Utility functions
def analyze_utr(utr):
    return [utr[-5:].count('A'), utr[-13:].count('C')]

def extract_sd_sequence(utr):
    return utr[-14:-8] if len(utr) >= 14 else ""

def compute_updated_sd_score(sequence, matrix):
    return sum(matrix[nucleotide_to_index.get(nt, 0), i] for i, nt in enumerate(sequence))

def score_utr(utr):
    sd_seq = extract_sd_sequence(utr)
    score = compute_updated_sd_score(sd_seq, optimized_matrix)
    return sd_seq, score

def build_seq(utr, cds):
    utr_len = min(len(utr), 40)
    utr_part = utr[-utr_len:]
    cds_need = 120 - utr_len
    cds_part = cds[:cds_need] if len(cds) >= cds_need else cds
    return utr_part + cds_part

def gen_variants(base_seq, labels):
    return {lbl: base_seq[:int(lbl.replace("E40w", ""))] for lbl in labels}

def calc_energy(seq):
    p = subprocess.run(['RNAfold'], input=seq, capture_output=True, text=True)
    try:
        energy = p.stdout.strip().split('\n')[-1].split()[-1].strip("()")
        return round(float(energy), 4)
    except:
        return None

def pipeline(utr, cds):
    base = build_seq(utr, cds)
    variants = gen_variants(base, energy_labels)
    return [calc_energy(seq) for seq in variants.values()]

def calculateInitiationRate(utr, cds):
    seq = utr + cds
    energy = np.array(pipeline(utr, cds)).reshape(1, -1)
    energy = scaler1.transform(energy)
    energy = pca.transform(energy)

    sd_seq, sd_score = score_utr(utr)
    base_features = np.array([sd_score, len(seq)] + analyze_utr(utr)).reshape(1, -1)
    base_features = scaler2.transform(base_features)

    final_input = np.concatenate([base_features, energy], axis=1)
    prediction = model.predict(final_input)[0]
    return prediction**2

# Example usage
if __name__ == "__main__":
    utr = "AGGAGGTTTAAACATGCGTGGTGACGAAGGCTTGTTATTTT"
    cds = "ATGGCTGAAGGTCAGGTTGACGTAGATGCCGGAATTCGCGTTCGATGGAATTCGTAGTGGTTGAGCGTTTACGTACGATAG"
    rate = calculateInitiationRate(utr, cds)
    print(f"Predicted Initiation Rate: {round(rate, 4)}")
