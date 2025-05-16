import React, { useState } from 'react';
import Category from '../products/Category';
import Beverages from '../products/Beverages';

const Inventory = () => {
  const [tab, setTab] = useState('category');

  return (
    <div>
      <h1>Inventory Management</h1>
      <div>
        <button onClick={() => setTab('category')}>Manage Categories</button>
        <button onClick={() => setTab('beverage')}>Manage Beverages</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {tab === 'category' && <Category />}
        {tab === 'beverage' && <Beverages />}
      </div>
    </div>
  );
};

export default Inventory;
