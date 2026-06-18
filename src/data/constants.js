export const DATA_SETS = {
    prose: [
        "Innovation distinguishes between a leader and a follower in the modern tech industry.",
        "To achieve great things, two things are needed: a plan, and not quite enough time.",
        "Quality means doing it right when no one is looking. This is the essence of true engineering.",
        "The best way to predict the future is to invent it. Start building tomorrow today.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Design is not just what it looks like and feels like. Design is how it works under the hood.",
        "Simplicity is the ultimate sophistication. Strive for elegant, minimalist solutions.",
        "Your most unhappy customers are your greatest source of learning and innovation.",
        "Continuous improvement is better than delayed perfection. Ship early, iterate fast.",
        "Data beats emotions. Base your decisions on concrete analytics and empirical evidence."
    ],
    javascript: [
        "const response = await fetch('/api/v1/users');",
        "const optimized = data.filter(n => n > 0).map(n => n * 2);",
        "export default function PremiumComponent({ title }) { return <h1>{title}</h1>; }",
        "const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);",
        "Promise.all([fetchData1(), fetchData2()]).then(responses => console.log(responses));",
        "Object.entries(config).forEach(([key, value]) => applySettings(key, value));",
        "class Singleton { static getInstance() { return this.instance || (this.instance = new this()); } }",
        "const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), delay); }; };",
        "const flatten = arr => arr.reduce((flat, next) => flat.concat(Array.isArray(next) ? flatten(next) : next), []);",
        "app.use((err, req, res, next) => res.status(500).json({ error: err.message }));"
    ]
};
