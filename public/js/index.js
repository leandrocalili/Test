import { supabase } from "../../supabase/supabase.js";

let carrinho = [];

// Global variables
let currentProduct = null;
let selectedSize = null;
let currentQuantity = 1;
let produtos = [];

// Initialize cart from localStorage
window.addEventListener("DOMContentLoaded", () => {
  carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  atualizarCarrinho();
});

// Função para carregar produtos do Supabase
async function carregarProdutos() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Erro ao carregar produtos:", error);
    return;
  }

  // Save products globally
  window.produtos = data;
  produtos = data;

  // Salvar os produtos no localStorage
  localStorage.setItem("produtos", JSON.stringify(data));

  let numeroWhatsApp = localStorage.getItem("whatsapp") || "+553398681074";
  let instagram = localStorage.getItem("instagram") || "https://instagram.com/estilourbano.itacity";
  const container = document.getElementById("produtos");

  container.innerHTML = "";

  data.forEach((produto) => {
    const div = document.createElement("div");
    div.classList.add("produto");
    div.innerHTML = `
      <img src="${produto.image_url}" alt="${produto.name}">
      <h2>${produto.name}</h2>
      <span class="preco">R$ ${parseFloat(produto.price).toFixed(2)}</span>
      <button onclick="mostrarDetalhesProduto(${JSON.stringify(produto).replace(/"/g, "&quot;")})">
        Ver Detalhes
      </button>
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
window.adicionarAoCarrinho = function (id, quantidade = 1, tamanho = null, personalizacao = "") {
  // Get the product from the products array
  const produto = produtos.find((p) => p.id === id);

  if (!produto) {
    console.error("Produto não encontrado:", id);
    return;
  }

  // Create cart item with new properties
  const item = {
    id: produto.id,
    name: produto.name,
    price: produto.price,
    quantidade: quantidade || 1,
    tamanho: tamanho || produto.size.split(",")[0].trim(),
    personalizacao: personalizacao || "",
    image_url: produto.image_url,
  };

  // Get existing cart from localStorage
  carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  // Check if product already exists with same size and personalization
  const itemExistente = carrinho.findIndex(
    (i) =>
      i.id === item.id && i.tamanho === item.tamanho && i.personalizacao === item.personalizacao
  );

  if (itemExistente !== -1) {
    carrinho[itemExistente].quantidade += quantidade;
  } else {
    carrinho.push(item);
  }

  // Save cart to localStorage
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  // Update cart display
  atualizarCarrinho();

  // Feedback visual ao adicionar ao carrinho
  const carrinhoElement = document.querySelector(".carrinho");
  if (carrinhoElement) {
    carrinhoElement.style.transform = "scale(1.1)";
    setTimeout(() => {
      carrinhoElement.style.transform = "none";
    }, 200);
  }

  // Show confirmation
  alert("Produto adicionado ao carrinho!");
};

// Função para atualizar o carrinho na interface
function atualizarCarrinho() {
  const itensCarrinho = document.getElementById("itens-carrinho");
  const totalCarrinho = document.getElementById("total-carrinho");

  if (!itensCarrinho || !totalCarrinho) return;

  // Limpar o conteúdo anterior
  itensCarrinho.innerHTML = "";

  // Calcular o total
  let total = 0;

  carrinho.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("item-carrinho");

    // Use default image if image_url is undefined
    const imageUrl = item.image_url || "./public/images/placeholder.jpg";

    let itemInfo = `
      <img src="${imageUrl}" alt="${item.name || "Produto"}">
      <div class="item-info">
        <h3>${item.name || "Produto"}</h3>
        <p>Tamanho: ${item.tamanho || "Único"}</p>
        <p>Quantidade: ${item.quantidade || 1}</p>`;

    if (item.personalizacao) {
      itemInfo += `<p class="personalizacao">Personalização: ${item.personalizacao}</p>`;
    }

    const price = parseFloat(item.price) || 0;
    const quantidade = item.quantidade || 1;

    itemInfo += `</div>
      <span class="item-preco">R$ ${(price * quantidade).toFixed(2)}</span>
      <button class="remover-item" onclick="removerDoCarrinho(${index})">×</button>
    `;

    div.innerHTML = itemInfo;
    itensCarrinho.appendChild(div);

    total += price * quantidade;
  });

  // Atualizar o total do carrinho
  totalCarrinho.innerText = total.toFixed(2);

  // Atualizar a quantidade de itens no ícone do carrinho
  const quantidadeElement = document.getElementById("quantidade-carrinho");
  if (quantidadeElement) {
    quantidadeElement.innerText = carrinho.reduce(
      (total, item) => total + (parseInt(item.quantidade) || 1),
      0
    );
  }
}

// Função para remover um item do carrinho
window.removerDoCarrinho = function (index) {
  carrinho.splice(index, 1); // Remover o produto do carrinho
  localStorage.setItem("carrinho", JSON.stringify(carrinho)); // Atualizar localStorage
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
  let numeroWhatsApp = "+553398681074";
  if (!numeroWhatsApp) {
    alert("Número de WhatsApp não configurado!");
    return;
  }

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let mensagem = "Olá, gostaria de fazer um pedido:\n\n";
  carrinho.forEach((item) => {
    mensagem += `Produto: ${item.name}\n`;
    mensagem += `Tamanho: ${item.tamanho}\n`;
    mensagem += `Quantidade: ${item.quantidade}\n`;
    mensagem += `Preço unitário: R$ ${parseFloat(item.price).toFixed(2)}\n`;
    mensagem += `Subtotal: R$ ${(parseFloat(item.price) * item.quantidade).toFixed(2)}\n`;

    if (item.personalizacao) {
      mensagem += `Personalização: ${item.personalizacao}\n`;
    }

    mensagem += `\n`;
  });

  let formaPagamento = document.getElementById("forma-pagamento").value;
  let total = document.getElementById("total-carrinho").innerText;
  mensagem += `Forma de pagamento: ${formaPagamento}\nTotal: R$ ${total}\n\nObrigado!`;

  let link = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(link, "_blank");
};

// Function to show product details modal
window.mostrarDetalhesProduto = function (produto) {
  currentProduct = produto;
  selectedSize = null;
  currentQuantity = 1;

  // Set product details
  document.getElementById("detalhe-imagem").src = produto.image_url;
  document.getElementById("detalhe-nome").textContent = produto.name;
  document.getElementById("detalhe-preco").textContent = parseFloat(produto.price).toFixed(2);
  document.getElementById("quantidade-produto").value = 1;

  // Set size options
  const tamanhos = produto.size.split(",").map((t) => t.trim());
  const tamanhosContainer = document.getElementById("opcoes-tamanho");
  tamanhosContainer.innerHTML = "";

  tamanhos.forEach((tamanho) => {
    const btn = document.createElement("button");
    btn.textContent = tamanho;
    btn.className = "btn-tamanho";
    btn.onclick = function () {
      document.querySelectorAll(".btn-tamanho").forEach((b) => b.classList.remove("selected"));
      this.classList.add("selected");
      selectedSize = tamanho;
    };
    tamanhosContainer.appendChild(btn);
  });

  // Show/hide personalization field
  const personalizacaoContainer = document.getElementById("personalizacao-container");
  if (produto.personalizavel) {
    personalizacaoContainer.style.display = "block";
    const nomeInput = document.getElementById("texto-personalizacao-nome");
    const numeroInput = document.getElementById("texto-personalizacao-numero");

    if (nomeInput) nomeInput.value = "";
    if (numeroInput) numeroInput.value = "";
  } else {
    personalizacaoContainer.style.display = "none";
  }

  // Show modal
  document.getElementById("modal-produto").style.display = "flex";
};

window.fecharModalProduto = function () {
  document.getElementById("modal-produto").style.display = "none";
};

window.aumentarQuantidade = function () {
  const input = document.getElementById("quantidade-produto");
  input.value = parseInt(input.value) + 1;
  currentQuantity = parseInt(input.value);
};

window.diminuirQuantidade = function () {
  const input = document.getElementById("quantidade-produto");
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
    currentQuantity = parseInt(input.value);
  }
};

window.adicionarAoCarrinhoDetalhes = function () {
  if (!selectedSize) {
    alert("Por favor, selecione um tamanho");
    return;
  }

  let personalizacao = "";
  if (currentProduct.personalizavel) {
    const nomeInput = document.getElementById("texto-personalizacao-nome");
    const numeroInput = document.getElementById("texto-personalizacao-numero");

    const nome = nomeInput ? nomeInput.value : "";
    const numero = numeroInput ? numeroInput.value : "";

    if (nome || numero) {
      personalizacao = `Nome: ${nome || "N/A"}, Número: ${numero || "N/A"}`;
    }
  }

  // Add to cart with size and personalization
  adicionarAoCarrinho(currentProduct.id, currentQuantity, selectedSize, personalizacao);

  fecharModalProduto();
};

// Carregar os produtos ao iniciar a página
carregarProdutos();
