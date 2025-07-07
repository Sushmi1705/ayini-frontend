
const API_URL = 'http://localhost:5000/product';

export const getAllProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product details');
  return response.json();
};

export const addProduct = async (formData) => {
  const response = await fetch(`${API_URL}/add`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add product');
  return response.json();
};

export const updateProduct = async (id, formData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body: formData, // ✅ let the browser set the headers
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};


export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

// ✅ Tax APIs
export const getTax = async () => {
    const response = await fetch(`${API_URL}/tax`);
    if (!response.ok) throw new Error('Failed to fetch tax');
    return response.json(); // returns: { value: ... }
  };
  
  export const setTax = async (taxValue) => {
    const response = await fetch(`${API_URL}/tax`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: taxValue }),
    });
    if (!response.ok) throw new Error('Failed to set tax');
    return response.json(); // returns: { message: ... }
  };

  export async function getShippingSettings() {
    try {
      const response = await fetch(`${API_URL}/getShipping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data; // Assumes API returns JSON like: { productShippingFees: [], shippingCaps: {...} }
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      throw error;
    }
  }

  export async function setShippingSettings(settings) {
    try {
      const response = await fetch(`${API_URL}/setShipping`, {
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
  
    const response = await fetch(`${API_URL}/uploadImage`, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
  
    const data = await response.json();
    return data.imageUrl; // return the Firebase Storage URL
  };
  