const fs = require('fs');
const path = require('path');

// Simple base64 encoded PNG data for a 192x192 icon
const icon192Base64 = `iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDgvMDEvMjLQrJqZAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI0LTEwLTIwVDIwOjI1OjAwKzAwOjAw0J+WJAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0xMC0yMFQyMDoyNTowMCswMDowMNCvmqQAAAAASUVORK5CYII=`;

// Simple base64 encoded PNG data for a 512x512 icon
const icon512Base64 = `iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDgvMDEvMjLQrJqZAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI0LTEwLTIwVDIwOjI1OjAwKzAwOjAw0J+WJAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0xMC0yMFQyMDoyNTowMCswMDowMNCvmqQAAAAASUVORK5CYII=`;

// Convert base64 to buffer and write files
const icon192Buffer = Buffer.from(icon192Base64, 'base64');
const icon512Buffer = Buffer.from(icon512Base64, 'base64');

fs.writeFileSync(path.join(__dirname, '../public/icons/icon-192x192.png'), icon192Buffer);
fs.writeFileSync(path.join(__dirname, '../public/icons/icon-512x512.png'), icon512Buffer);

console.log('✅ Icons created successfully!');
console.log('📁 192x192 icon: public/icons/icon-192x192.png');
console.log('📁 512x512 icon: public/icons/icon-512x512.png');
