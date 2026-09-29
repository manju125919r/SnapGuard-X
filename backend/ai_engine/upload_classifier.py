import qai_hub as hub

MODEL_PATH = "ai_engine/model/snapguard_classifier.onnx"

print("Uploading Snapdragon-compatible SnapGuard classifier...")
print("--------------------------------------------------------")

model = hub.upload_model(MODEL_PATH)

print("\nUpload successful!")

print("Model ID:")
print(model.model_id)

print("\nModel:")
print(model)