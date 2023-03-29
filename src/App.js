import "./style.css";
import supabase from "./superbase";
import { useEffect, useState } from "react";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentCategory, setCurrentCategory] = useState("全部");
  const [sessionID, setSessionID] = useState("");

  useEffect(
    function () {
      async function getPrompts() {
        setIsLoading(true);
        let query = supabase.from("prompts").select("*");
        if (currentCategory !== "全部") {
          query = query.eq("category", currentCategory);
        }

        const { data: prompts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);
        console.log(error);

        if (!error) setPrompts(prompts);
        else alert("获取数据出问题了");
        setPrompts(prompts);
        setIsLoading(false);
      }

      getPrompts();
    },
    [currentCategory]
  );
  useEffect(() => {
    const id = Math.random().toString(36).substring(2);
    setSessionID(id);
  }, []);

  console.log("id", sessionID);

  return (
    <>
      {/*Header */}

      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewPromptForm setPrompts={setPrompts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <PromptList prompts={prompts} setPrompts={setPrompts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">加载中...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "AI绘画提示词";
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "关闭" : "分享提示词"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "艺术风格", color: "#3b82f6" },
  { name: "画面光线", color: "#16a34a" },
  { name: "材质质感", color: "#ef4444" },
  { name: "色彩色调", color: "#eab308" },
  { name: "画面构图", color: "#db2777" },
  { name: "渲染技术", color: "#14b8a6" },
];

// 定义一个函数，接收一个字符串作为参数
function isValidUrl(string) {
  // 尝试使用URL构造函数创建一个URL对象
  let url;
  try {
    url = new URL(string);
  } catch (e) {
    // 如果抛出异常，说明字符串不是有效的网址，返回false
    return false;
  }
  // 如果没有异常，说明字符串是有效的网址，返回true
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewPromptForm({ setPrompts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSumbit(e) {
    e.preventDefault();
    console.log(text, source, category);

    if (text && source && isValidUrl(source) && category && textLength <= 200) {
      // const newPrompt = {
      //   id: Math.round(Math.random() * 1000000),
      //   text,
      //   source,
      //   category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };
      setIsUploading(true);

      const { data: newPrompt, error } = await supabase
        .from("prompts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      console.log(newPrompt);
      if (!error) setPrompts((prompts) => [newPrompt[0], ...prompts]);

      setText("");
      setSource("");
      setCategory("");

      setShowForm(false);
    }
  }
  return (
    <form className="prompt-form" onSubmit={handleSumbit}>
      <input
        type="text"
        placeholder="分享一个提示词"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="图片链接"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">选择标签:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        提交
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("全部")}
          >
            全部
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PromptList({ prompts, setPrompts }) {
  //TEMPORARY
  if (prompts.length === 0)
    return (
      <p className="message">
        这个标签还没有相应的提示词,快来创建第一个提示词✨
      </p>
    );

  return (
    <section>
      <ul className="prompts-list">
        {prompts.map((prompt) => (
          <Prompt key={prompt.id} prompt={prompt} setPrompts={setPrompts} />
        ))}
      </ul>
      <p className="par">现在有{prompts.length}个提示词,添加一个你自己的!</p>
    </section>
  );
}

function Prompt({ prompt, setPrompts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    prompt.votesInteresting + prompt.votesMindblowing < prompt.votesFalse;
  const [isDisabled, setIsDisabled] = useState(false); // 新增一个状态，用于判断按钮是否被禁用
  async function handleVote(columnName) {
    setIsUpdating(true);
    setIsDisabled(true); // 点击按钮后，将所有按钮禁用
    const { data: updatedFact, error } = await supabase
      .from("prompts")
      .update({ [columnName]: prompt[columnName] + 1 })
      .eq("id", prompt.id)
      .select();
    setIsUpdating(false);
    setIsDisabled(false); // 更新完成后，将所有按钮解禁

    console.log(updatedFact);
    if (!error)
      setPrompts((prompts) =>
        prompts.map((p) => (p.id === prompt.id ? updatedFact[0] : p))
      );
  }

  return (
    <li className="prompt">
      <div className="container">
        <div className="item">
          <a className="source" href={prompt.source} target="_blank">
            <img
              className="pic"
              src={prompt.source}
              alt="picture"
              width="auto"
              height="380px"
            />
          </a>
        </div>
        <div className="itempro">
          <p>
            {isDisputed ? <span className="disputed">[🚫不推荐]</span> : null}
            {prompt.text}
          </p>
          <div>
            <span
              className="tag"
              style={{
                backgroundColor: CATEGORIES.find(
                  (cat) => cat.name === prompt.category
                ).color,
              }}
            >
              {prompt.category}
            </span>
            <div className="vote-buttons">
              <button
                onClick={() => handleVote("votesInteresting")}
                disabled={isUpdating || isDisabled} // 将按钮的禁用状态与isDisabled状态绑定
              >
                👍 {prompt.votesInteresting}
              </button>
              <button
                onClick={() => handleVote("votesMindblowing")}
                disabled={isUpdating || isDisabled} // 将按钮的禁用状态与isDisabled状态绑定
              >
                🤯 {prompt.votesMindblowing}
              </button>
              <button
                onClick={() => handleVote("votesFalse")}
                disabled={isUpdating || isDisabled} // 将按钮的禁用状态与isDisabled状态绑定
              >
                ⛔️ {prompt.votesFalse}
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default App;
