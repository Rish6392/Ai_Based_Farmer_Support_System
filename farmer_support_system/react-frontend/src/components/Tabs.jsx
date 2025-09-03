import React, { useState } from 'react';

const Tabs = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="w-full">
      <div className="border-b border-gray-700 bg-gray-900">
        <nav className="-mb-px flex space-x-8 px-6">
          {React.Children.map(children, (child, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === index
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              {child.props.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="bg-gray-900 h-full">
        {React.Children.toArray(children)[activeTab]}
      </div>
    </div>
  );
};

const TabPanel = ({ children, label }) => {
  return <div>{children}</div>;
};

Tabs.Panel = TabPanel;

export default Tabs;
