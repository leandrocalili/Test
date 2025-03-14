import { supabase } from "../../supabase/supabase.js";

// Global variable to track if we're in edit mode
let editingProductId = null;

window.adicionarProduto = async function () {
  const nome = document.getElementById("nome").value;
  const quantidade = document.getElementById("quantidade").value;
  const tamanho = document.getElementById("tamanho").value;
  const preco = document.getElementById("preco").value;
  const imagemInput = document.getElementById("imagem");

  if (!nome || !quantidade || !tamanho || !preco) {
    return;
  }

  try {
    let base64Image = null;

    // Only process image if a new one is provided
    if (imagemInput.files.length > 0) {
      const imagemFile = imagemInput.files[0];
      base64Image = await convertToBase64(imagemFile);
    }

    // If we're editing, update the product
    if (editingProductId) {
      const updateData = {
        name: nome,
        stock_quantity: quantidade,
        size: tamanho,
        price: preco,
      };

      // Only update image if a new one is provided
      if (base64Image) {
        updateData.image_url = base64Image;
      }

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", editingProductId);

      if (error) {
        return;
      }

      // Reset edit mode
      editingProductId = null;
      document.getElementById("submitBtn").textContent = "Adicionar Produto";
      document.getElementById("cancelBtn").style.display = "none";
    }
    // Otherwise create a new product
    else {
      if (!imagemInput.files.length) {
        return;
      }

      const { data, error } = await supabase.from("products").insert([
        {
          name: nome,
          stock_quantity: quantidade,
          size: tamanho,
          price: preco,
          image_url: base64Image,
        },
      ]);

      if (error) {
        return;
      }
    }

    // Clear form fields after successful addition/update
    document.getElementById("nome").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("tamanho").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("imagem").value = "";

    atualizarProdutos();
  } catch (err) {
    return;
  }
};

// Function to convert file to base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

window.editarProduto = async function (id) {
  // Get the product data
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    return;
  }

  // Fill the form with product data
  document.getElementById("nome").value = data.name;
  document.getElementById("quantidade").value = data.stock_quantity;
  document.getElementById("tamanho").value = data.size;
  document.getElementById("preco").value = data.price;

  // Set edit mode
  editingProductId = id;
  document.getElementById("submitBtn").textContent = "Atualizar Produto";

  // Show cancel button
  const cancelBtn = document.getElementById("cancelBtn");
  if (!cancelBtn) {
    const form = document.querySelector("form");
    const newCancelBtn = document.createElement("button");
    newCancelBtn.id = "cancelBtn";
    newCancelBtn.type = "button";
    newCancelBtn.textContent = "Cancelar";
    newCancelBtn.onclick = cancelarEdicao;
    form.appendChild(newCancelBtn);
  } else {
    cancelBtn.style.display = "inline-block";
  }

  // Scroll to form
  document.querySelector("form").scrollIntoView({ behavior: "smooth" });
};

window.cancelarEdicao = function () {
  // Reset form
  document.getElementById("nome").value = "";
  document.getElementById("quantidade").value = "";
  document.getElementById("tamanho").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("imagem").value = "";

  // Reset edit mode
  editingProductId = null;
  document.getElementById("submitBtn").textContent = "Adicionar Produto";
  document.getElementById("cancelBtn").style.display = "none";
};

window.removerProduto = async function (id) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return;
  }

  atualizarProdutos();
};

async function atualizarProdutos() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    return;
  }

  const container = document.getElementById("produtos");

  container.innerHTML = "";
  data.forEach((produto) => {
    const div = document.createElement("div");
    div.classList.add("produto");
    div.innerHTML = `
      <div class="produto-actions">
        <button class="editar" onclick="editarProduto(${produto.id})">✏️</button>
        <button class="remover" onclick="removerProduto(${produto.id})">❌</button>
      </div>
      <img src="${produto.image_url}" alt="${produto.name}">
      <h2>${produto.name}</h2>
      <p>Quantidade: ${produto.stock_quantity}</p>
      <p>Tamanho: ${produto.size}</p>
      <span class="preco">R$ ${parseFloat(produto.price).toFixed(2)}</span>
    `;
    container.appendChild(div);
  });
}

window.cancelarMudanca = function () {
  document.getElementById("nome").value = "";
  document.getElementById("quantidade").value = "";
  document.getElementById("tamanho").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("imagem").value = "";
};

atualizarProdutos();
