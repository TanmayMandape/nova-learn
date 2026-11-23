// ============================================================
// DEMO LECTURE DATA — Hardcoded for product demonstration only.
// No AI APIs, no database writes, no backend calls.
// Replace with real API integration in a later phase.
// ============================================================

export const DEMO_LECTURE = {
  id: "demo-ann-001",
  subject: "Artificial Neural Networks",
  title: "Introduction to Artificial Neural Networks",
  date: "22 November 2026",
  duration: "45 minutes",
  status: "Demo Lecture",
  faculty: "Prof. Sharma",
  summary: `This lecture introduces Artificial Neural Networks (ANNs), computational models inspired by the structure and functioning of biological neural networks. It explains how artificial neurons receive inputs, apply weights and biases, and use activation functions to produce outputs.

The lecture covers perceptron architecture, common activation functions, forward propagation, and how neural networks learn patterns from training data. It also introduces practical applications such as image recognition, speech processing, prediction, and classification.`,

  topics: [
    "Introduction to Neural Networks",
    "Biological vs Artificial Neurons",
    "Perceptron Architecture",
    "Weights and Biases",
    "Activation Functions (Sigmoid, ReLU, Tanh)",
    "Forward Propagation",
    "Applications of Neural Networks",
  ],

  learningOutcomes: [
    "Understand what an Artificial Neural Network is and how it is inspired by biology.",
    "Identify the components of a single artificial neuron.",
    "Describe the perceptron model and its role as the foundational unit.",
    "Explain how weights and biases influence a network's output.",
    "Compare activation functions: Sigmoid, ReLU, and Tanh.",
    "Trace the forward propagation process through a simple network.",
    "List at least four real-world applications of ANNs.",
  ],

  transcript: `[DEMO TRANSCRIPT — Sample content for demonstration purposes]

Good morning everyone. Today we begin our unit on Artificial Neural Networks, one of the most exciting areas of modern computing.

Let us start with some intuition. The human brain contains roughly 86 billion neurons. Each neuron receives signals, processes them, and passes output to other neurons. Artificial Neural Networks are mathematical models that mimic this behaviour computationally.

A single artificial neuron, sometimes called a node or unit, takes a set of numerical inputs — let us call them x1, x2, and x3. Each input is multiplied by a weight, which represents how important that input is to the final answer. The neuron also adds a bias term, which shifts the activation threshold.

The sum of weighted inputs plus bias is then passed through an activation function. The activation function decides whether the neuron should fire or not. Without activation functions, the entire network would just be a linear equation and could not learn complex patterns.

The simplest model of a neuron is called the Perceptron, introduced by Frank Rosenblatt in 1958. A perceptron takes binary inputs, computes a weighted sum, and outputs one or zero based on a threshold.

Now let us talk about activation functions. The Sigmoid function maps any input to a value between 0 and 1, which is useful for probability outputs. ReLU, or Rectified Linear Unit, simply outputs the input if it is positive and zero otherwise. ReLU is widely used in modern deep learning because it is computationally efficient and avoids the vanishing gradient problem. Tanh, or hyperbolic tangent, maps inputs to a range of minus one to plus one and is useful when outputs need to be centred around zero.

Forward propagation is the process of passing data through the network from input layer to output layer. At each layer, the weighted sums are computed and activation functions are applied. The final output is compared to the expected answer using a loss function.

Neural networks learn by adjusting weights during a process called training. We use an algorithm called backpropagation combined with gradient descent to minimise the loss.

In terms of applications, neural networks are used in image recognition systems, speech recognition, natural language processing, medical diagnosis, financial prediction, and autonomous vehicles. They form the foundation of modern deep learning.

That concludes today's introductory lecture. In our next session we will cover multi-layer perceptrons and backpropagation in detail.`,

  aiNotes: `📚 AI Generated Notes — Introduction to Artificial Neural Networks
[Demo — structured summary of lecture content]

──────────────────────────────────────────
1. DEFINITION
──────────────────────────────────────────
An Artificial Neural Network (ANN) is a computational model inspired by biological neural networks in the human brain. It consists of layers of interconnected nodes (neurons) that process and transmit information.

──────────────────────────────────────────
2. COMPONENTS OF AN ARTIFICIAL NEURON
──────────────────────────────────────────
• Inputs (x₁, x₂, … xₙ): numerical values fed into the neuron.
• Weights (w₁, w₂, … wₙ): determine the importance of each input.
• Bias (b): a constant added to shift the activation threshold.
• Weighted Sum: z = (w₁x₁ + w₂x₂ + … + wₙxₙ) + b
• Activation Function: applied to z to produce output.

──────────────────────────────────────────
3. PERCEPTRON ARCHITECTURE
──────────────────────────────────────────
• The simplest neural network unit, introduced in 1958 by Frank Rosenblatt.
• Takes binary inputs, computes a weighted sum, outputs 0 or 1 based on a threshold.
• Cannot solve non-linearly separable problems (e.g. XOR).

──────────────────────────────────────────
4. WEIGHTS AND BIASES
──────────────────────────────────────────
• Weights control the strength of connection between neurons.
• Bias allows the activation to shift, independent of input.
• Both are adjusted during training via backpropagation.

──────────────────────────────────────────
5. ACTIVATION FUNCTIONS
──────────────────────────────────────────
• Sigmoid: σ(z) = 1 / (1 + e⁻ᶻ) → Output range: (0, 1) — used for probability.
• ReLU: f(z) = max(0, z) → Efficient, avoids vanishing gradient — most popular today.
• Tanh: f(z) = (eᶻ − e⁻ᶻ)/(eᶻ + e⁻ᶻ) → Output range: (−1, 1) — zero-centred.

──────────────────────────────────────────
6. FORWARD PROPAGATION
──────────────────────────────────────────
• Data flows from Input Layer → Hidden Layer(s) → Output Layer.
• At each layer: z = Wx + b, then apply activation function.
• Output compared to true labels using a loss function.

──────────────────────────────────────────
7. APPLICATIONS
──────────────────────────────────────────
• Image recognition (CNNs)
• Speech recognition and NLP
• Medical diagnosis
• Financial forecasting
• Autonomous vehicles
• Recommendation systems

──────────────────────────────────────────
8. KEY TAKEAWAYS
──────────────────────────────────────────
• ANNs are inspired by biology but implemented mathematically.
• A neuron computes: output = activation(Σ wᵢxᵢ + b)
• Activation functions introduce non-linearity — essential for learning complex patterns.
• Forward propagation = data flowing from input to output.
• Learning happens during training via backpropagation + gradient descent.`,

  attachedPDFs: [
    { name: "ANN_Introduction_Slides.pdf", size: "2.4 MB" },
    { name: "Perceptron_and_MLP_Notes.pdf", size: "1.1 MB" },
    { name: "Activation_Functions_Reference.pdf", size: "0.8 MB" },
  ],
};

// ============================================================
// DEMO ASSIGNMENT — 5 MCQ + 5 Short Answer
// ============================================================

export const DEMO_ASSIGNMENT = {
  id: "demo-assign-001",
  title: "Assignment 1 — Introduction to Artificial Neural Networks",
  lecture_id: "demo-ann-001",
  generated_by: "Demo (hardcoded)",
  mcq: [
    {
      question: "What is an Artificial Neural Network primarily inspired by?",
      options: [
        "A) Electrical circuits",
        "B) Biological neural networks in the human brain",
        "C) Mathematical set theory",
        "D) Compiler design principles",
      ],
      answer: "B) Biological neural networks in the human brain",
      explanation:
        "ANNs are computational models designed to mimic the way biological neurons in the brain receive, process, and transmit information.",
    },
    {
      question: "What does the bias term do in an artificial neuron?",
      options: [
        "A) Multiplies the input values",
        "B) Removes the need for weights",
        "C) Shifts the activation threshold independently of the input",
        "D) Normalises the output to between 0 and 1",
      ],
      answer: "C) Shifts the activation threshold independently of the input",
      explanation:
        "The bias allows a neuron to activate even when all inputs are zero, giving the model more flexibility.",
    },
    {
      question: "Which activation function outputs values strictly between 0 and 1?",
      options: ["A) ReLU", "B) Tanh", "C) Sigmoid", "D) Linear"],
      answer: "C) Sigmoid",
      explanation:
        "Sigmoid maps any real number to the range (0, 1), making it useful for binary classification and probability outputs.",
    },
    {
      question: "What is the main advantage of the ReLU activation function?",
      options: [
        "A) It outputs values between −1 and 1",
        "B) It is computationally efficient and avoids the vanishing gradient problem",
        "C) It is the oldest known activation function",
        "D) It guarantees zero output for all negative inputs in all networks",
      ],
      answer: "B) It is computationally efficient and avoids the vanishing gradient problem",
      explanation:
        "ReLU's simplicity (max(0, z)) speeds up training and prevents gradients from becoming extremely small in deep networks.",
    },
    {
      question: "In forward propagation, data flows in which direction?",
      options: [
        "A) Output layer → Hidden layers → Input layer",
        "B) Input layer → Output layer → Hidden layers",
        "C) Input layer → Hidden layer(s) → Output layer",
        "D) Randomly between all layers",
      ],
      answer: "C) Input layer → Hidden layer(s) → Output layer",
      explanation:
        "Forward propagation moves data from input through hidden layers to the output, computing weighted sums and activations at each step.",
    },
  ],
  shortAnswer: [
    {
      question: "Define an Artificial Neural Network in one or two sentences.",
      sampleAnswer:
        "An Artificial Neural Network is a computational model composed of layers of interconnected artificial neurons that mimic biological neural processing to learn patterns from data.",
    },
    {
      question: "What is the role of weights in an artificial neuron?",
      sampleAnswer:
        "Weights determine the importance or strength of each input signal. During training, weights are adjusted to minimise prediction error.",
    },
    {
      question:
        "Compare Sigmoid and Tanh activation functions. What is one key difference?",
      sampleAnswer:
        "Sigmoid outputs values in the range (0, 1), while Tanh outputs values in the range (−1, 1). Tanh is zero-centred, which can lead to faster convergence during training.",
    },
    {
      question: "What is a Perceptron and what is its limitation?",
      sampleAnswer:
        "A Perceptron is the simplest neural network unit that computes a weighted sum of binary inputs and outputs 0 or 1. Its limitation is that it cannot solve problems that are not linearly separable, such as XOR.",
    },
    {
      question: "Name three real-world applications of Artificial Neural Networks.",
      sampleAnswer:
        "Three real-world applications include: (1) image recognition in computer vision, (2) speech recognition in virtual assistants, and (3) medical diagnosis systems that detect diseases from scans.",
    },
  ],
};
