import os
import numpy as np
import onnxruntime as ort


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.onnx"
)


class SnapGuardONNXModel:
    def __init__(self):
        self.session = None
        self.input_name = None
        self.classes = [
            "SAFE",
            "SCAM",
            "SUSPICIOUS"
        ]

        self.load_model()

    def load_model(self):
        """
        Load the SnapGuard X ONNX model.
        """

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"ONNX model not found: {MODEL_PATH}"
            )

        self.session = ort.InferenceSession(
            MODEL_PATH,
            providers=["CPUExecutionProvider"]
        )

        self.input_name = (
            self.session.get_inputs()[0].name
        )

        print("SnapGuard ONNX model loaded.")
        print(
            "ONNX provider:",
            self.session.get_providers()
        )

    def predict(self, text):
        """
        Predict SAFE / SCAM / SUSPICIOUS
        from input text.
        """

        if not text or not text.strip():
            raise ValueError(
                "Text cannot be empty."
            )

        text = text.strip()

        outputs = self.session.run(
            None,
            {
                self.input_name: np.array(
                    [[text]],
                    dtype=object
                )
            }
        )

        prediction_output = outputs[0]
        probability_output = outputs[1]

        prediction = str(
            prediction_output[0]
        )

        probability_map = probability_output[0]

        probabilities = {}

        for class_name in self.classes:
            probabilities[class_name] = float(
                probability_map.get(
                    class_name,
                    0.0
                )
            )

        confidence = probabilities.get(
            prediction,
            0.0
        )

        return {
            "prediction": prediction,
            "confidence": confidence,
            "probabilities": probabilities
        }


# --------------------------------------------------
# Create one reusable model instance
# --------------------------------------------------

onnx_model = SnapGuardONNXModel()


# --------------------------------------------------
# Simple helper
# --------------------------------------------------

def predict_text_onnx(text):
    """
    Convenience function used by SnapGuard X backend.
    """

    return onnx_model.predict(text)