import { buildApiUrl, fetchJson } from "./apiClient";


export const getAllProducts = async () => {
  return fetchJson("/product");
};

export const getProductById = async (id) => {
  return fetchJson(`/product/${id}`);
};

export const addProduct = async (formData) => {
  const response = await fetch(buildApiUrl("/product/add"), {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add product');
  return response.json();
};

export const updateProduct = async (id, formData) => {
  const response = await fetch(buildApiUrl(`/product/${id}`), {
    method: 'PUT',
    body: formData, // ✅ let the browser set the headers
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};


export const deleteProduct = async (id) => {
  const response = await fetch(buildApiUrl(`/product/${id}`), {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

// ✅ Tax APIs
export const getTax = async () => {
    return fetchJson("/product/tax");
  };
  
  export const setTax = async (taxValue) => {
    const response = await fetch(buildApiUrl("/product/tax"), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: taxValue }),
    });
    if (!response.ok) throw new Error('Failed to set tax');
    return response.json(); // returns: { message: ... }
  };

  export async function getShippingSettings() {
    return fetchJson("/product/getShipping");
  }

  export async function setShippingSettings(settings) {
    try {
      const response = await fetch(buildApiUrl("/product/setShipping"), {
        method: 'POST', // or 'PUT' depending on your backend setup
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data; // Assumes API returns something like { success: true, message: 'Settings saved' }
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      throw error;
    }
  }

  export const uploadProductImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
  
    const response = await fetch(buildApiUrl("/product/uploadImage"), {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
  
    const data = await response.json();
    return data.imageUrl; // return the Firebase Storage URL
  };
  
