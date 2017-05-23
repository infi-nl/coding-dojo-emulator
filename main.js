(function (Chip8) {
  function createInstance(description) {
   var template        = document.getElementById("emulatorTemplate"),
       node            = template.cloneNode(true),
       descriptionNode = node.getElementsByClassName("description")[0],
       body            = document.getElementById("content");

    node.removeAttribute("id");
    descriptionNode.innerHTML = description;

    body.appendChild(node);

    new Chip8.UI(node);
  };

  createInstance("Load a ROM and watch how it is executed. You can a breakpoint by clicking an instruction.");

}(window.Chip8));
