import React from 'react';
   
  const MemeList = (props) => (
      props.data.allMemeImgs.map(item => (
          <option key={item.id} name={item.id} value={item.url}>{item.name}</option>
      ))  
  );


export default MemeList