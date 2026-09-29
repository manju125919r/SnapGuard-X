import qai_hub as hub

MODEL_PATH = "ai_engine/model/snapguard_snapdragon.onnx"

print("Uploading final Snapdragon-compatible SnapGuard model...")
print("--------------------------------------------------------")

model = hub.upload_model(MODEL_PATH)

print("\nUpload successful!")

print("Model ID:")
print(model.model_id)

print("\nModel:")
print(model)

print("\nThis is the model we will compile for Snapdragon X Elite.")