type LocalStorageState<T> = {
  state: Ref<T>;
  setState: (value: T) => void;
  removeItem: () => void;
  clearStorage: () => void;
};

function useLocalStorage<T>(key: string): LocalStorageState<T> {
  const storedValue = localStorage.getItem(key)!;
  if (!storedValue) {
    console.error("Error get localStorage: ", key, "'s value is null");
  }
  const state = ref<T>(JSON.parse(storedValue) as T) as Ref<T>;
  function setState(value: T) {
    // 直接赋值，并添加类型断言
    state.value = value;

    try {
      localStorage.setItem(key, JSON.stringify(state.value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return {
    state,
    setState,
    removeItem: () => {
      localStorage.removeItem(key);
    },
    clearStorage: () => {
      localStorage.clear();
      // 可选：重置所有state至初始值（取决于你的应用需求）
      // state.value = initialValue;
    },
  };
}

export default useLocalStorage;
