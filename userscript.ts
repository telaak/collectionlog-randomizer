let userJson: CollectionLogUser;

async function fetchUserJson() {
  const pathName = window.location.pathname;
  const user = pathName.split("/")[2];
  const json = await fetch(
    `https://api.collectionlog.net/collectionlog/user/${user}`
  ).then((res) => res.json());
  userJson = json;
}

fetchUserJson();

type CollectionLogUser = {
  collectionLogId: string;
  userId: string;
  collectionLog: CollectionLog;
};

type CollectionLogTab = {
  [key: string]: {
    items: CollectionlogItem[];
  };
};

type CollectionLog = {
  tabs: {
    Bosses: CollectionLogTab;
    Clues: CollectionLogTab;
    Minigames: CollectionLogTab;
    Other: CollectionLogTab;
    Raids: CollectionLogTab;
  };
};

type CollectionlogItem = {
  id: number;
  name: string;
  quantity: number;
  obtained: boolean;
  obtainedAt: string | null;
  sequence: number;
};

const styles = `
    .glow {
      animation: glow 1s infinite alternate;
    }

    @keyframes glow {
        from {
            box-shadow: 0 0 10px -10px #aef4af;
        }
        to {
            box-shadow: 0 0 10px 10px #aef4af;
        }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getUnobtainedItems(tab: CollectionLogTab, tabName: string) {
  const array = [];
  for (const [key, value] of Object.entries(tab)) {
    for (const item of value.items) {
      if (!item.obtained) {
        array.push({
          tabName,
          key,
          item,
        });
      }
    }
  }
  return array;
}

function getRandomItem() {
  const tabs = userJson.collectionLog.tabs;
  const allItems = [];
  for (const [key, value] of Object.entries(tabs)) {
    const unobtainedItems = getUnobtainedItems(value, key);
    allItems.push(...unobtainedItems);
  }

  const randomItem = allItems[getRandomInt(0, allItems.length + 1)];

  return randomItem;
}

function simulateMouseClick(targetNode: Node) {
  function triggerMouseEvent(targetNode: Node, eventType: MouseEvent["type"]) {
    const clickEvent = document.createEvent("MouseEvents");
    clickEvent.initEvent(eventType, true, true);
    targetNode.dispatchEvent(clickEvent);
  }
  ["mouseover", "mousedown", "mouseup", "click"].forEach(function (eventType) {
    triggerMouseEvent(targetNode, eventType);
  });
}

const tabs = ["Bosses", "Raids", "Clues", "Minigames", "Other"];

function openTab(index: number) {
  const tabList = document.querySelector("div[role]") as Element;
  const children = Array.from(tabList.childNodes);
  simulateMouseClick(children[index]);
}

function openSubtab(text: string) {
  const list = document.querySelector(
    'div[data-state="active"] > div'
  ) as Element;
  const children = Array.from(list.childNodes);
  const targetNode = children.find((n) => n.textContent === text);
  if (targetNode) simulateMouseClick(targetNode);
}

function highlightItem(name: string) {
  const activeTab = document.querySelectorAll('div[data-state="active"] > div');
  const itemList = activeTab[1];
  const paragraphs = itemList.querySelectorAll("p");
  const itemNode = Array.from(paragraphs).find((n) => n.textContent === name);
  if (itemNode) {
    const parent = itemNode.parentElement?.parentElement as HTMLElement;
    parent.classList.add("glow");
  }
}

function randomize() {
  const randomItem = getRandomItem();
  console.log(randomItem);
  openTab(tabs.indexOf(randomItem.tabName));
  setTimeout(() => {
    openSubtab(randomItem.key);
  }, 100);
  setTimeout(() => {
    highlightItem(randomItem.item.name);
  }, 100);
}
