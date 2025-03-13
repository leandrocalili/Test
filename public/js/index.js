import { supabase } from "../../supabase/supabase.js";

let carrinho = [];

// Função para carregar produtos do Supabase
async function carregarProdutos() {
  const { data, err } = await supabase.from("products").select("*");

  if (err) {
    return;
  }

  // Salvar os produtos no localStorage
  localStorage.setItem("produtos", JSON.stringify(data));

  let numeroWhatsApp = localStorage.getItem("whatsapp");
  let instagram = localStorage.getItem("instagram");
  const container = document.getElementById("produtos");

  container.innerHTML = "";

  data.forEach((produto) => {
    const div = document.createElement("div");
    div.classList.add("produto");
    div.innerHTML = `
      <img src="${produto.image_url}" alt="${produto.name}">
      <h2>${produto.name}</h2>
      <span class="preco">R$ ${parseFloat(produto.price).toFixed(2)}</span>
      <button onclick="adicionarAoCarrinho('${produto.id}')">Adicionar ao Carrinho</button>
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

// Função para adicionar um produto ao carrinho
window.adicionarAoCarrinho = function (id) {
  // Recuperar os produtos do localStorage
  let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

  // Converter o ID passado para número
  let idNumerico = Number(id);

  // Encontrar o produto pelo ID
  let produto = produtos.find((p) => p.id === idNumerico);

  if (produto) {
    carrinho.push(produto);
    atualizarCarrinho();

    // Feedback visual ao adicionar ao carrinho
    const carrinhoElement = document.querySelector(".carrinho");
    carrinhoElement.style.transform = "scale(1.1)";
    setTimeout(() => {
      carrinhoElement.style.transform = "none";
    }, 200);
  } else {
    return;
  }
};

// Função para atualizar o carrinho na interface
function atualizarCarrinho() {
  const itensCarrinho = document.getElementById("itens-carrinho");
  const totalCarrinho = document.getElementById("total-carrinho");

  // Limpar o conteúdo anterior
  itensCarrinho.innerHTML = "";

  // Calcular o total
  let total = 0;

  carrinho.forEach((produto, index) => {
    const div = document.createElement("div");
    div.classList.add("item-carrinho");
    div.innerHTML = `
      <span>${produto.name} - R$ ${parseFloat(produto.price).toFixed(2)}</span>
      <button onclick="removerDoCarrinho(${index})">Remover</button>
    `;
    itensCarrinho.appendChild(div);

    total += parseFloat(produto.price);
  });

  // Atualizar o total do carrinho
  totalCarrinho.innerText = total.toFixed(2);

  // Atualizar a quantidade de itens no ícone do carrinho
  document.getElementById("quantidade-carrinho").innerText = carrinho.length;
}

// Função para remover um item do carrinho
window.removerDoCarrinho = function (index) {
  carrinho.splice(index, 1); // Remover o produto do carrinho
  atualizarCarrinho();
};

// Função para mostrar o modal do carrinho
window.mostrarCarrinho = function () {
  document.getElementById("modal-carrinho").style.display = "block";
};

// Função para fechar o modal do carrinho
window.fecharCarrinho = function () {
  document.getElementById("modal-carrinho").style.display = "none";
};

// Função para enviar o pedido via WhatsApp
window.enviarPedido = function () {
  let numeroWhatsApp = localStorage.getItem("whatsapp");
  if (!numeroWhatsApp) {
    alert("Número de WhatsApp não configurado!");
    return;
  }

  let mensagem = "Olá, gostaria de fazer um pedido:\n\n";
  carrinho.forEach((produto) => {
    mensagem += `Produto: ${produto.name}\nPreço: R$ ${parseFloat(produto.price).toFixed(2)}\n\n`;
  });

  let formaPagamento = document.getElementById("forma-pagamento").value;
  let total = document.getElementById("total-carrinho").innerText;
  mensagem += `Forma de pagamento: ${formaPagamento}\nTotal: R$ ${total}\n\nObrigado!`;

  let link = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(link, "_blank");
};

// Carregar os produtos ao iniciar a página
carregarProdutos();
