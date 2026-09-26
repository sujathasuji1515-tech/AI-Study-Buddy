import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const API = "http://localhost:5000/api";

/* --------------------------------
   AI RESPONSE EXTRACTOR
--------------------------------- */

function extractAIContent(data) {
  if (!data) {
    return "No response received from server.";
  }

  // Plain string
  if (typeof data === "string") {
    return data;
  }

  // Common text fields
  if (typeof data.content === "string") {
    return data.content;
  }

  if (typeof data.output === "string") {
    return data.output;
  }

  if (typeof data.text === "string") {
    return data.text;
  }

  if (typeof data.summary === "string") {
    return data.summary;
  }

  /* --------------------------------
     FLASHCARDS
  --------------------------------- */

  if (Array.isArray(data.cards)) {
    return data.cards
      .map(
        (card, index) =>
          `### Card ${index + 1}

**Question:** ${card.question || "No question"}

**Answer:** ${card.answer || "No answer"}`
      )
      .join("\n\n---\n\n");
  }

  /* --------------------------------
     QUIZ
  --------------------------------- */

  if (Array.isArray(data.questions)) {
    return data.questions
      .map((question, index) => {
        const options = Array.isArray(question.options)
          ? question.options
              .map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`)
              .join("\n")
          : "";

        return `### Question ${index + 1}

**${question.question || question.text || "Question"}**

${options}

**Answer:** ${
          question.answer ||
          question.correctAnswer ||
          question.correct_option ||
          "Not provided"
        }`;
      })
      .join("\n\n---\n\n");
  }

  // Some APIs may return quiz inside "quiz"
  if (Array.isArray(data.quiz)) {
    return data.quiz
      .map((question, index) => {
        const options = Array.isArray(question.options)
          ? question.options
              .map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`)
              .join("\n")
          : "";

        return `### Question ${index + 1}

**${question.question || question.text || "Question"}**

${options}

**Answer:** ${
          question.answer ||
          question.correctAnswer ||
          question.correct_option ||
          "Not provided"
        }`;
      })
      .join("\n\n---\n\n");
  }

  /* --------------------------------
     NESTED DATA RESPONSE
  --------------------------------- */

  if (data.data) {
    const nestedResult = extractAIContent(data.data);

    if (nestedResult !== "No readable AI output received.") {
      return nestedResult;
    }
  }

  /* --------------------------------
     GEMINI RESPONSE
  --------------------------------- */

  if (Array.isArray(data.candidates)) {
    const parts = [];

    for (const candidate of data.candidates) {
      const candidateParts = candidate?.content?.parts;

      if (Array.isArray(candidateParts)) {
        for (const part of candidateParts) {
          if (part?.text) {
            parts.push(part.text);
          }
        }
      }
    }

    if (parts.length > 0) {
      return parts.join("\n\n");
    }
  }

  /* --------------------------------
     ERROR RESPONSE
  --------------------------------- */

  if (data.error) {
    if (typeof data.error === "string") {
      return `### AI Error

${data.error}`;
    }

    if (data.error.message) {
      return `### AI Error

${data.error.message}`;
    }
  }

  return "No readable AI output received.";
}


/* =================================
   MAIN APP
================================= */

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [materials, setMaterials] = useState([]);

  const [material, setMaterial] = useState({
    title: "",
    subject: "",
    content: ""
  });

  const [output, setOutput] = useState("");


  /* =================================
     LOGIN / REGISTER
  ================================= */

  async function authSubmit(e) {
    e.preventDefault();

    try {
      const endpoint =
        mode === "login" ? "login" : "register";

      const res = await fetch(
        `${API}/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Authentication failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);

    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }
  }


  /* =================================
     LOAD MATERIALS
  ================================= */

  async function loadMaterials() {
    try {
      const res = await fetch(
        `${API}/material`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        return;
      }

      setMaterials(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Load materials error:", error);
    }
  }


  useEffect(() => {
    if (token) {
      loadMaterials();
    }
  }, [token]);


  /* =================================
     SAVE MATERIAL
  ================================= */

  async function saveMaterial(e) {
    e.preventDefault();

    if (!material.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!material.subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    if (!material.content.trim()) {
      alert("Please enter study material.");
      return;
    }

    try {
      const res = await fetch(
        `${API}/material/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(material)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save material.");
        return;
      }

      setMaterial({
        title: "",
        subject: "",
        content: ""
      });

      await loadMaterials();

      setOutput("Material saved successfully.");

    } catch (error) {
      console.error(error);
      setOutput("Failed to connect to server.");
    }
  }


  /* =================================
     AI GENERATE
  ================================= */

  async function generate(path, body) {
    setOutput("Generating...");

    try {
      const res = await fetch(
        `${API}/ai/${path}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      );

      const data = await res.json();

      console.log("AI SERVER RESPONSE:", data);

      if (!res.ok) {
        setOutput(
          `### AI Error\n\n${
            data.message ||
            data.error?.message ||
            "Something went wrong."
          }`
        );
        return;
      }

      const result = extractAIContent(data);

      setOutput(result);

    } catch (error) {
      console.error("AI error:", error);

      setOutput(
        "### Connection Error\n\nFailed to connect to the server."
      );
    }
  }


  /* =================================
     LOGIN PAGE
  ================================= */

  if (!token) {
    return (
      <main className="container">

        <h1>AI StudyBuddy</h1>

        <p>
          AI-powered learning assistant
        </p>

        <form
          onSubmit={authSubmit}
          className="card"
        >

          {mode === "register" && (
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />
          )}

          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />

          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />

          <button type="submit">
            {mode === "login"
              ? "Login"
              : "Register"}
          </button>

          <button
            type="button"
            onClick={() =>
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              )
            }
          >
            Switch to{" "}
            {mode === "login"
              ? "Register"
              : "Login"}
          </button>

        </form>

      </main>
    );
  }


  /* =================================
     MAIN APP
  ================================= */

  return (
    <main className="container">

      {/* HEADER */}

      <header>
        <h1>AI StudyBuddy</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken("");
          }}
        >
          Logout
        </button>
      </header>


      {/* ADD MATERIAL */}

      <section className="card">

        <h2>
          Add Study Material
        </h2>

        <form onSubmit={saveMaterial}>

          <input
            placeholder="Title"
            value={material.title}
            onChange={(e) =>
              setMaterial({
                ...material,
                title: e.target.value
              })
            }
          />

          <input
            placeholder="Subject"
            value={material.subject}
            onChange={(e) =>
              setMaterial({
                ...material,
                subject: e.target.value
              })
            }
          />

          <textarea
            placeholder="Paste study material here..."
            rows="8"
            value={material.content}
            onChange={(e) =>
              setMaterial({
                ...material,
                content: e.target.value
              })
            }
          />

          <button type="submit">
            Save Material
          </button>

        </form>

      </section>


      {/* YOUR MATERIALS */}

      <section className="card">

        <h2>
          Your Materials
        </h2>

        {materials.length === 0 ? (
          <p>
            No study materials yet.
          </p>
        ) : (
          materials.map((m) => (

            <article
              key={m._id}
              className="material"
            >

              <h3>
                {m.title}
              </h3>

              <p>
                {m.subject}
              </p>


              {/* SUMMARY */}

              <button
                onClick={() =>
                  generate(
                    `summary/${m._id}`,
                    {}
                  )
                }
              >
                Summarize
              </button>


              {/* FLASHCARDS */}

              <button
                onClick={() =>
                  generate(
                    "flashcards",
                    {
                      content: m.content,
                      materialId: m._id
                    }
                  )
                }
              >
                Flashcards
              </button>


              {/* QUIZ */}

              <button
                onClick={() =>
                  generate(
                    "quiz",
                    {
                      content: m.content,
                      materialId: m._id
                    }
                  )
                }
              >
                Quiz
              </button>

            </article>

          ))
        )}

      </section>


      {/* AI OUTPUT */}

      <section className="card">

        <h2>
          AI Output
        </h2>

        <div className="ai-output">

          <ReactMarkdown>
            {output || "AI output will appear here."}
          </ReactMarkdown>

        </div>

      </section>

    </main>
  );
}