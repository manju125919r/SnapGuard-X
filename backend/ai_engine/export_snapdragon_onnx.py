import os
import joblib
import numpy as np
import onnx
from onnx import helper, numpy_helper, TensorProto


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.joblib"
)

OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_snapdragon.onnx"
)


# ---------------------------------------------------------
# Load trained model
# ---------------------------------------------------------

print("Loading SnapGuard X trained model...")
print("------------------------------------")

pipeline = joblib.load(MODEL_PATH)

tfidf = pipeline.named_steps["tfidf"]
classifier = pipeline.named_steps["classifier"]

print("Model loaded.")
print("TF-IDF vocabulary:", len(tfidf.vocabulary_))
print("Classes:", classifier.classes_)


# ---------------------------------------------------------
# Extract trained Logistic Regression parameters
# ---------------------------------------------------------

weights = classifier.coef_.astype(np.float32)
bias = classifier.intercept_.astype(np.float32)

print("\nClassifier weights shape:")
print(weights.shape)

print("\nClassifier bias shape:")
print(bias.shape)


# ---------------------------------------------------------
# Build ONNX graph
# ---------------------------------------------------------

print("\nBuilding Snapdragon-compatible ONNX graph...")
print("----------------------------------------------")

input_tensor = helper.make_tensor_value_info(
    "features",
    TensorProto.FLOAT,
    [1, 277]
)

output_tensor = helper.make_tensor_value_info(
    "probabilities",
    TensorProto.FLOAT,
    [1, 3]
)


# Weights
weights_initializer = numpy_helper.from_array(
    weights,
    name="weights"
)

bias_initializer = numpy_helper.from_array(
    bias,
    name="bias"
)


# ---------------------------------------------------------
# Logistic Regression
# ---------------------------------------------------------

matmul_node = helper.make_node(
    "MatMul",
    inputs=["features", "weights_transposed"],
    outputs=["linear_output"],
    name="LogisticRegression_MatMul"
)


bias_node = helper.make_node(
    "Add",
    inputs=["linear_output", "bias"],
    outputs=["logits"],
    name="LogisticRegression_Add"
)


# Softmax gives probability tensor [1,3]
softmax_node = helper.make_node(
    "Softmax",
    inputs=["logits"],
    outputs=["probabilities"],
    axis=1,
    name="LogisticRegression_Softmax"
)


# Transpose weights because:
# features = [1,277]
# weights = [3,277]
# required MatMul:
# [1,277] × [277,3]

weights_transposed = numpy_helper.from_array(
    weights.T,
    name="weights_transposed"
)


# ---------------------------------------------------------
# Create graph
# ---------------------------------------------------------

graph = helper.make_graph(
    nodes=[
        matmul_node,
        bias_node,
        softmax_node
    ],
    name="SnapGuardX_LogisticRegression",
    inputs=[
        input_tensor
    ],
    outputs=[
        output_tensor
    ],
    initializer=[
        weights_transposed,
        bias_initializer
    ]
)


# ---------------------------------------------------------
# Create ONNX model
# ---------------------------------------------------------

model = helper.make_model(
    graph,
    producer_name="SnapGuard-X",
    ir_version=10,
    opset_imports=[
        helper.make_opsetid("", 17)
    ]
)


# ---------------------------------------------------------
# Validate model
# ---------------------------------------------------------

onnx.checker.check_model(model)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

with open(OUTPUT_PATH, "wb") as f:
    f.write(model.SerializeToString())


print("\nONNX model created successfully!")

print("\nSaved to:")
print(OUTPUT_PATH)

print("\nInput:")
print("features -> float32 [1, 277]")

print("\nOutput:")
print("probabilities -> float32 [1, 3]")

print("\nClasses:")
print(classifier.classes_)

print("\nSnapGuard Snapdragon ONNX model ready.")