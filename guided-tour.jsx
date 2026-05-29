// 轻量引导提示 — 仅首次使用触发，2 步引导
// Step 1: 指向推荐的第一颗星
// Step 2: 打开详情面板后介绍三个 tab

function GuidedTour({ step, recommended, selectedId, onDismiss }) {
  const [pos, setPos] = useState(null);

  // Step 1: 定位推荐的第一颗星在屏幕上的位置
  useEffect(() => {
    if (step !== 1 || !recommended || !recommended.length) return;

    const targetId = recommended[0].id;
    // 找到 SVG 中对应的星点元素
    const svgEl = document.querySelector('.con-svg');
    if (!svgEl) return;

    // 通过 STAR_POS 计算屏幕坐标
    const svgRect = svgEl.getBoundingClientRect();
    const viewBox = svgEl.viewBox.baseVal;

    // 从 window 全局获取星点位置
    // 遍历 SVG 子元素找到对应的星点 g 元素
    const starGroups = svgEl.querySelectorAll('g[style]');
    let targetRect = null;
    for (const g of starGroups) {
      const circles = g.querySelectorAll('circle');
      if (circles.length >= 2) {
        // 查看 text 元素是否包含目标名称
        const text = g.querySelector('text');
        if (text && text.textContent === recommended[0].name) {
          targetRect = g.getBoundingClientRect();
          break;
        }
      }
    }

    if (targetRect) {
      setPos({
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top,
      });
    } else {
      // fallback: 计算位置（使用 viewBox 映射）
      const scaleX = svgRect.width / viewBox.width;
      const scaleY = svgRect.height / viewBox.height;
      // 简单 fallback 到屏幕中心偏上
      setPos({
        x: svgRect.left + svgRect.width / 2,
        y: svgRect.top + svgRect.height * 0.3,
      });
    }
  }, [step, recommended]);

  // Step 2: 详情面板打开后的引导
  const showStep2 = step === 2 && selectedId;

  if (step === 1 && pos) {
    return (
      <div className="gt-overlay" onClick={onDismiss}>
        <div
          className="gt-tooltip"
          style={{ left: pos.x, top: pos.y - 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="gt-arrow"></div>
          <div className="gt-text">
            点击这颗星，开始你的编程之旅
          </div>
          <button className="gt-btn" onClick={onDismiss}>知道了</button>
        </div>
      </div>
    );
  }

  if (showStep2) {
    return (
      <div className="gt-overlay gt-overlay-light" onClick={onDismiss}>
        <div
          className="gt-tooltip gt-tooltip-panel"
          onClick={e => e.stopPropagation()}
        >
          <div className="gt-text">
            每个知识点有三个标签页：
            <br /><b>详解</b> — 概念、例题、易错点
            <br /><b>测验</b> — AI 现场出题检验掌握度
            <br /><b>AI 答疑</b> — 有问题随时问
          </div>
          <button className="gt-btn" onClick={onDismiss}>开始探索</button>
        </div>
      </div>
    );
  }

  return null;
}

window.GuidedTour = GuidedTour;
