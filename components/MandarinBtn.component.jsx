import styles from "../styles/Home.module.css";
import { SplitButton, Dropdown } from "react-bootstrap";
import { getCursor } from "../utils/utils";
import MusicList from "../public/music_list.json";

const activeColor = "#BEA5C1";

export default function MandarinBtn({
  languageFilter,
  initialFilter,
  setLanguageState,
  setInitialState,
}) {
  // 生成可用语言（这里假设你只关注“国语”，可扩展）
  const languageOptions = ["国语"];

  // 动态生成首字母数组，安全处理空值
  const availableAlphabets = Array.from(
    new Set(
      MusicList
        .map((x) => x.initial)
        .filter((initial) => typeof initial === "string" && initial.length === 1)
    )
  ).sort();

  return (
    <div className="d-grid">
      {languageOptions.map((lang) => (
        <SplitButton
          key={lang}
          title={lang}
          className={
            languageFilter === lang
              ? styles.mandarinBtnActive
              : styles.mandarinBtn
          }
          onClick={() => {
            languageFilter === lang
              ? setLanguageState("")
              : setLanguageState(lang);
          }}
        >
          {availableAlphabets.map((alphabet) => (
            <Dropdown.Item
              key={alphabet}
              onClick={() => {
                initialFilter === alphabet
                  ? setInitialState("")
                  : setInitialState(alphabet);
              }}
              style={
                initialFilter === alphabet
                  ? { backgroundColor: activeColor, cursor: getCursor() }
                  : { cursor: getCursor() }
              }
            >
              首字母-{alphabet}
            </Dropdown.Item>
          ))}
        </SplitButton>
      ))}
    </div>
  );
}