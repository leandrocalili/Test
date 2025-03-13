let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function adicionarProduto() {
  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const preco = document.getElementById("preco").value;
  const imagemInput = document.getElementById("imagem");

  if (!nome || !descricao || !preco || !imagemInput.files.length) {
    alert("Preencha todos os campos!");
    return;
  }

  const imagem = URL.createObjectURL(imagemInput.files[0]);
  const novoProduto = { nome, descricao, preco, imagem };
  produtos.push(novoProduto);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  atualizarProdutos();
}

function removerProduto(index) {
  produtos.splice(index, 1);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  atualizarProdutos();
}

function atualizarProdutos() {
  const container = document.getElementById("produtos");
  container.innerHTML = "";
  produtos.forEach((produto, index) => {
    const div = document.createElement("div");
    div.classList.add("produto");
    div.innerHTML = `
                    <button class="remover" onclick="removerProduto(${index})">X</button>
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <h2>${produto.nome}</h2>
                    <p>${produto.descricao}</p>
                    <span class="preco">R$ ${parseFloat(produto.preco).toFixed(2)}</span>
                `;
    container.appendChild(div);
  });
}

function salvarWhatsApp() {
  const numero = document.getElementById("whatsapp").value.trim();
  if (numero) {
    localStorage.setItem("whatsapp", numero);
    alert("Número de WhatsApp salvo!");
  } else {
    alert("Digite um número válido!");
  }
}

atualizarProdutos();
