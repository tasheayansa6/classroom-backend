
import cors from "cors";
import express from 'express';
import subjectsRouter from "./routes/subjects.js"; // lowercase 's'
const app = express();
const PORT = 8000;

app.use(
    cors({
        origin: process.env.FRONTEND_URL, // React app URL
        methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
        credentials: true, // allow cookies
    })
);
app.use(express.json());
app.use("/api/subjects", subjectsRouter);


app.get('/', (req , res) => {
    res.send('Hello,welcome to class API!');
});

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});


