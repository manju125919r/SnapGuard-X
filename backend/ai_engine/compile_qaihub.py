import qai_hub as hub

MODEL_PATH = "ai_engine/model/snapguard_text_model.onnx"

print("Uploading SnapGuard X ONNX model to Qualcomm AI Hub...")

model = hub.upload_model(
    MODEL_PATH
)

print("\nModel uploaded successfully.")
print("Model ID:")
print(model.model_id)

print("\nModel:")
print(model)