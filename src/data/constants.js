export const DATA_SETS = {
    prose: [
        "[Name], innovation distinguishes between a leader and a follower.",
        "To achieve great things, [Name], two things are needed: a plan, and time.",
        "Quality means doing it right when no one is looking, [Name].",
        "The best way to predict the future is to invent it, [Name].",
        "[Name], success is not final, failure is not fatal.",
        "Design is not just what it looks like, [Name]. Design is how it works.",
        "Simplicity is the ultimate sophistication, [Name].",
        "Your most unhappy customers are your greatest source of learning, [Name].",
        "[Name], continuous improvement is better than delayed perfection.",
        "Data beats emotions, [Name]. Base your decisions on analytics."
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
