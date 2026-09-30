import sys
import os

# Ensure we can import from backend
sys.path.append(os.getcwd())

import torch

def test_nlp_anchors_audit():
    print("--- SUPPLYCHAINER: NLP ANCHOR SYSTEM AUDIT ---")
    
    try:
        from backend.engine.threat_intelligence import ContrastiveNLPEngine
        nlp = ContrastiveNLPEngine()
        
        if not nlp._ready:
            print("FAILED: NLP Engine not ready.")
            return

        # Verification 1: Matrix Source
        print("\nVERIFYING MATRIX SOURCE:")
        if os.path.exists("Execution/nlp_anchors.pt"):
            anchors = torch.load("Execution/nlp_anchors.pt", map_location=torch.device("cuda" if torch.cuda.is_available() else "cpu"))
            print(f"  Source Found: Execution/nlp_anchors.pt")
            print(f"  Corpus Version: {anchors.get('corpus_version')}")
            print(f"  Disaster Matrix Shape: {anchors['disaster_matrix'].shape}")
            print(f"  Safe Matrix Shape: {anchors['safe_matrix'].shape}")
            
            if "Historical" in anchors.get('corpus_version', ''):
                print("  VERIFIED: System is anchored on Historical Logistics Incident Corpora.")
            else:
                print("  WARNING: Matrix found but version is not historical.")
        else:
            print("  CRITICAL FAILURE: No persistent anchor matrix found. Using runtime defaults?")

        # Verification 2: Semantic Diversity Test
        print("\nVERIFYING SEMANTIC DIVERSITY (Subtle Threats):")
        test_cases = [
            ("Minor berthing congestion at terminal B-4 has increased vessel turnaround times by 18%.", "Subtle Congestion"),
            ("Customs IT systems are experiencing intermittent connectivity, slowing down border clearance for HGV traffic.", "Infrastructure Glitch"),
            ("Everything is fine and the sun is shining.", "Safe State")
        ]
        
        for text, label in test_cases:
            score = nlp.get_semantic_score(text)
            print(f"  [{label}] Score: {score:.3f}")
            
        print("\nAUDIT COMPLETE.")

    except Exception as e:
        print(f"AUDIT FAILED: {e}")

if __name__ == "__main__":
    test_nlp_anchors_audit()
