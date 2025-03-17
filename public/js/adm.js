import { supabase } from "../../supabase/supabase.js";

// Global variable to track if we're in edit mode
let editingProductId = null;

// Create notification element
const createNotification = () => {
  const notification = document.createElement("div");
  notification.className = "notification";
  document.body.appendChild(notification);
  return notification;
};

// Show notification
const showNotification = (message, type = "success") => {
  let notification = document.querySelector(".notification");

  if (!notification) {
    notification = createNotification();
  }

  notification.textContent = message;
  notification.className = `notification ${type}`;

  // Add icon based on type
  const icon = document.createElement("i");
  icon.className = type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle";
  notification.prepend(icon);

  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
};

window.adicionarProduto = async function () {
  const nome = document.getElementById("nome").value;
  const quantidade = document.getElementById("quantidade").value;
  const tamanho = document.getElementById("tamanho").value.trim();
  const preco = document.getElementById("preco").value;
  const imagemInput = document.getElementById("imagem");

  if (!nome || !quantidade || !tamanho || !preco) {
    showNotification("Por favor, preencha todos os campos obrigatórios", "error");
    return;
  }

  // Validate tamanho format (comma-separated values)
  const tamanhos = tamanho
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);
  if (tamanhos.length === 0) {
    showNotification("Por favor, informe pelo menos um tamanho válido", "error");
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
        size: tamanho, // Store as comma-separated string
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
        showNotification("Erro ao atualizar produto: " + error.message, "error");
        return;
      }

      showNotification("Produto atualizado com sucesso!");

      // Reset edit mode
      editingProductId = null;
      document.getElementById("submitBtn").textContent = "Adicionar Produto";
      document.getElementById("cancelBtn").style.display = "none";
    }
    // Otherwise create a new product
    else {
      if (!imagemInput.files.length) {
        showNotification("Por favor, selecione uma imagem para o produto", "error");
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
        showNotification("Erro ao adicionar produto: " + error.message, "error");
        return;
      }

      showNotification("Produto adicionado com sucesso!");
    }

    // Clear form fields after successful addition/update
    document.getElementById("nome").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("tamanho").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("imagem").value = "";

    // Clear image preview if it exists
    const previewImg = document.querySelector(".file-preview img");
    if (previewImg) {
      previewImg.remove();
      document.querySelector(".file-preview").innerHTML =
        '<i class="fas fa-cloud-upload-alt"></i><span>Clique para selecionar uma imagem</span>';
    }

    atualizarProdutos();
  } catch (err) {
    showNotification("Erro inesperado: " + err.message, "error");
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

// Preview image before upload
window.previewImage = function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewContainer = document.querySelector(".file-preview");
      previewContainer.innerHTML = "";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = "Preview";

      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
};

window.editarProduto = async function (id) {
  // Get the product data
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    showNotification("Erro ao buscar dados do produto: " + error.message, "error");
    return;
  }

  // Fill the form with product data
  document.getElementById("nome").value = data.name;
  document.getElementById("quantidade").value = data.stock_quantity;
  document.getElementById("tamanho").value = data.size;
  document.getElementById("preco").value = data.price;

  // Preview the current image
  if (data.image_url) {
    const previewContainer = document.querySelector(".file-preview");
    previewContainer.innerHTML = "";

    const img = document.createElement("img");
    img.src = data.image_url;
    img.alt = "Preview";

    previewContainer.appendChild(img);
  }

  // Set edit mode
  editingProductId = id;
  document.getElementById("submitBtn").textContent = "Atualizar Produto";
  document.getElementById("submitBtn").innerHTML = '<i class="fas fa-save"></i> Atualizar Produto';

  // Show cancel button
  const cancelBtn = document.getElementById("cancelBtn");
  if (!cancelBtn) {
    const buttonGroup = document.querySelector(".button-group");
    const newCancelBtn = document.createElement("button");
    newCancelBtn.id = "cancelBtn";
    newCancelBtn.type = "button";
    newCancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
    newCancelBtn.onclick = cancelarEdicao;
    buttonGroup.appendChild(newCancelBtn);
  } else {
    cancelBtn.style.display = "inline-block";
  }

  // Scroll to form
  document.querySelector("form").scrollIntoView({ behavior: "smooth" });

  showNotification("Editando produto: " + data.name);
};

window.cancelarEdicao = function () {
  // Reset form
  document.getElementById("nome").value = "";
  document.getElementById("quantidade").value = "";
  document.getElementById("tamanho").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("imagem").value = "";

  // Clear image preview
  const previewContainer = document.querySelector(".file-preview");
  if (previewContainer) {
    previewContainer.innerHTML =
      '<i class="fas fa-cloud-upload-alt"></i><span>Clique para selecionar uma imagem</span>';
  }

  // Reset edit mode
  editingProductId = null;
  document.getElementById("submitBtn").innerHTML = '<i class="fas fa-plus"></i> Adicionar Produto';
  document.getElementById("cancelBtn").style.display = "none";

  showNotification("Edição cancelada");
};

window.removerProduto = async function (id) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    showNotification("Erro ao remover produto: " + error.message, "error");
    return;
  }

  showNotification("Produto removido com sucesso!");
  atualizarProdutos();
};

window.filtrarProdutos = function () {
  const searchInput = document.getElementById("search-input");
  const filter = searchInput.value.toUpperCase();
  const produtos = document.querySelectorAll(".produto");

  produtos.forEach((produto) => {
    const nome = produto.querySelector("h2").textContent.toUpperCase();
    if (nome.includes(filter)) {
      produto.style.display = "";
    } else {
      produto.style.display = "none";
    }
  });
};

async function atualizarProdutos() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    showNotification("Erro ao carregar produtos: " + error.message, "error");
    return;
  }

  const container = document.getElementById("produtos");

  if (data.length === 0) {
    container.innerHTML =
      '<div class="no-products"><i class="fas fa-box-open"></i><p>Nenhum produto cadastrado</p></div>';
    return;
  }

  container.innerHTML = "";
  data.forEach((produto) => {
    // Format sizes for display
    const tamanhos = produto.size
      .split(",")
      .map((t) => t.trim())
      .join(", ");

    const div = document.createElement("div");
    div.classList.add("produto");
    div.innerHTML = `
      <div class="produto-actions">
        <button class="editar" onclick="editarProduto(${
          produto.id
        })" title="Editar produto"><i class="fas fa-edit"></i></button>
        <button class="remover" onclick="removerProduto(${
          produto.id
        })" title="Remover produto"><i class="fas fa-trash-alt"></i></button>
      </div>
      <img src="${produto.image_url}" alt="${produto.name}">
      <h2>${produto.name}</h2>
      <p><i class="fas fa-cubes"></i> Quantidade: ${produto.stock_quantity}</p>
      <p><i class="fas fa-ruler"></i> Tamanhos: ${tamanhos}</p>
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

  // Clear image preview
  const previewContainer = document.querySelector(".file-preview");
  if (previewContainer) {
    previewContainer.innerHTML =
      '<i class="fas fa-cloud-upload-alt"></i><span>Clique para selecionar uma imagem</span>';
  }

  showNotification("Formulário limpo");
};

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  atualizarProdutos();

  // Setup image preview
  const imageInput = document.getElementById("imagem");
  if (imageInput) {
    imageInput.addEventListener("change", previewImage);
  }
});
