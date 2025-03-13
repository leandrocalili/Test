let carrinho = [];

function carregarProdutos() {
  let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  let numeroWhatsApp = localStorage.getItem("whatsapp");
  let instagram = localStorage.getItem("instagram");
  const container = document.getElementById("produtos");
  container.innerHTML = "";

  produtos.forEach((produto, index) => {
    const div = document.createElement("div");
    div.classList.add("produto");
    div.innerHTML = `
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <h2>${produto.nome}</h2>
                    <p>${produto.descricao}</p>
                    <span class="preco">R$ ${parseFloat(produto.preco).toFixed(2)}</span>
                    <button onclick="adicionarAoCarrinho(${index})">Adicionar ao Carrinho</button>
                `;
    container.appendChild(div);
  });

  if (numeroWhatsApp) {
    document.getElementById("link-whatsapp").href = `https://wa.me/${numeroWhatsApp}`;
  }
  if (instagram) {
    document.getElementById("link-instagram").href = instagram;
  }
}

function adicionarAoCarrinho(index) {
  let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  carrinho.push(produtos[index]);
  atualizarCarrinho();

  // Feedback visual ao adicionar ao carrinho
  const carrinhoElement = document.querySelector(".carrinho");
  carrinhoElement.style.transform = "scale(1.1)";
  setTimeout(() => {
    carrinhoElement.style.transform = "none";
  }, 200);
}

function atualizarCarrinho() {
  document.getElementById("quantidade-carrinho").innerText = carrinho.length;
  let total = carrinho.reduce((acc, produto) => acc + parseFloat(produto.preco), 0);
  document.getElementById("total-carrinho").innerText = total.toFixed(2);

  // Atualizar os itens no carrinho
  const itensCarrinho = document.getElementById("itens-carrinho");
  itensCarrinho.innerHTML = "";

  carrinho.forEach((produto, index) => {
    const div = document.createElement("div");
    div.classList.add("item-carrinho");
    div.innerHTML = `
                    <span>${produto.nome} - R$ ${parseFloat(produto.preco).toFixed(2)}</span>
                    <button onclick="removerDoCarrinho(${index})">Remover</button>
                `;
    itensCarrinho.appendChild(div);
  });
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1); // Remover o produto do carrinho
  atualizarCarrinho();
}

function mostrarCarrinho() {
  document.getElementById("modal-carrinho").style.display = "block";
}

function fecharCarrinho() {
  document.getElementById("modal-carrinho").style.display = "none";
}

function enviarPedido() {
  let numeroWhatsApp = localStorage.getItem("whatsapp");
  if (!numeroWhatsApp) {
    alert("Número de WhatsApp não configurado!");
    return;
  }

  let mensagem = "Olá, gostaria de fazer um pedido:\n\n";
  carrinho.forEach((produto) => {
    mensagem += `Produto: ${produto.nome}\nTamanho: ${produto.descricao}\nPreço: R$ ${parseFloat(
      produto.preco
    ).toFixed(2)}\n\n`;
  });

  let formaPagamento = document.getElementById("forma-pagamento").value;
  let total = document.getElementById("total-carrinho").innerText;
  mensagem += `Forma de pagamento: ${formaPagamento}\nTotal: R$ ${total}\n\nObrigado!`;

  let link = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(link, "_blank");
}

carregarProdutos();
