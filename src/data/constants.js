export const DATA_SETS = {
    prose: [
        "The complexity of a system is proportional to the number of moving parts.",
        "Code is read much more often than it is written, so write it for humans.",
        "A good programmer looks both ways before crossing a one-way street.",
        "Simplicity is the soul of efficiency and the ultimate sophistication.",
        "The best error message is the one that never shows up.",
        "Documentation is a love letter that you write to your future self.",
        "First, solve the problem. Then, write the code.",
        "It's not a bug; it's an undocumented feature in the ecosystem.",
        "Experience is the name everyone gives to their mistakes.",
        "Programs must be written for people to read, and only incidentally for machines to execute."
    ],
    javascript: [
        "const calculateSpeed = (distance, time) => time > 0 ? distance / time : 0;",
        "import React, { useState, useEffect } from 'react';",
        "export default function App() { return <div>Hello World</div>; }",
        "const [user, setUser] = useState(null);",
        "useEffect(() => { fetchUser().then(setUser); }, []);",
        "array.map(item => item * 2).filter(item => item > 10).reduce((a, b) => a + b, 0);",
        "if (loading) return <Spinner />; if (error) return <Error message={error.message} />;",
        "const debounce = (func, wait) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); }; };",
        "const isPalindrome = str => str === str.split('').reverse().join('');",
        "Promise.all([fetchData1(), fetchData2()]).then(([data1, data2]) => console.log(data1, data2));"
    ],
    python: [
        "def bubble_sort(arr): n = len(arr); for i in range(n): for j in range(0, n-i-1): if arr[j] > arr[j+1]: arr[j], arr[j+1] = arr[j+1], arr[j]",
        "class NeuralNetwork: def __init__(self, layers): self.layers = layers; self.weights = []; self.biases = []",
        "import pandas as pd; df = pd.read_csv('data.csv'); print(df.head())",
        "from flask import Flask, jsonify, request",
        "app = Flask(__name__)\n\n@app.route('/api', methods=['GET'])\ndef get_data(): return jsonify({'status': 'success'})",
        "with open('file.txt', 'r') as f: content = f.read()",
        "squared = [x**2 for x in range(10) if x % 2 == 0]",
        "try: risky_operation() except Exception as e: handle_error(e) finally: cleanup()",
        "import numpy as np; arr = np.array([1, 2, 3]); print(np.mean(arr))",
        "def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)"
    ],
    terminal: [
        "git commit -m 'feat: implemented new payment gateway integration'",
        "git push --force-with-lease origin main",
        "docker run -d -p 8080:80 --name web-server nginx:latest",
        "kubectl get pods --all-namespaces -o wide",
        "npm install --save-dev tailwindcss postcss autoprefixer",
        "pip install -r requirements.txt",
        "cargo build --release",
        "sudo systemctl restart nginx.service",
        "find . -name '*.log' -type f -delete",
        "tar -czvf archive.tar.gz /path/to/directory"
    ]
};
