import joblib

MODEL_PATH = "ai_engine/model/snapguard_text_model.joblib"

print("Loading SnapGuard X trained model...")
print("------------------------------------")

model = joblib.load(MODEL_PATH)

print("\nPipeline:")
print(model)

print("\nPipeline steps:")
for name, step in model.steps:
    print(f"\n{name}:")
    print(type(step))

print("\nTF-IDF vocabulary size:")
tfidf = model.named_steps["tfidf"]
print(len(tfidf.vocabulary_))

print("\nClassifier:")
classifier = model.named_steps["classifier"]
print(classifier)

print("\nClasses:")
print(classifier.classes_)

print("\nNumber of coefficients:")
print(classifier.coef_.shape)

print("\nModel inspection completed.")