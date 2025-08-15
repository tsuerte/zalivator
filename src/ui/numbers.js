// Логика UI для коллекции "Числа"
(function () {
  const collectionSelect = document.getElementById("collection");
  const applyBtn = document.getElementById("apply");
  const numbersRow = document.getElementById("numbersRow");
  const decimalCheckbox = document.getElementById("numbersDecimal");

  if (!collectionSelect || !applyBtn || !numbersRow || !decimalCheckbox) {
    // Интерфейс ещё не собран — тихо выходим
    return;
  }

  function isNumbersSelected() {
    return collectionSelect.value === "numbers";
  }

  function updateNumbersVisibility() {
    numbersRow.style.display = isNumbersSelected() ? "flex" : "none";
  }

  // Показать/скрыть при изменении коллекции
  collectionSelect.addEventListener("change", updateNumbersVisibility);

  // Инициализация видимости после подгрузки списка коллекций
  // Встроенный код вызывает логику после получения items, но мы подстрахуемся таймером
  setTimeout(updateNumbersVisibility, 0);

  // Перехватываем клик Apply для numbers
  applyBtn.addEventListener(
    "click",
    function (e) {
      if (!isNumbersSelected()) return; // не наша коллекция — не перехватываем
      e.preventDefault();
      e.stopImmediatePropagation();
      const numbersDecimal = !!decimalCheckbox.checked;
      parent.postMessage(
        {
          pluginMessage: {
            type: "apply",
            collection: "numbers",
            numbersDecimal,
          },
        },
        "*",
      );
    },
    true,
  ); // useCapture=true, чтобы сработать раньше onclick
})();

