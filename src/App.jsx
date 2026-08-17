import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';

import { TaskProvider } from './context/TaskContext';
import { TagProvider } from './context/TagContext';
import { ListProvider } from './context/ListContext';

import GlobalTaskForm from './features/tasks/components/GlobalTaskForm';
import TaskBoard from './features/lists/components/TaskBoard';
import GatewayApp from './features/gateway/GatewayApp';

/* Switch between apps using the VITE_APP_MODE env variable.
   Set VITE_APP_MODE=gateway to load the ESP32 gateway dashboard.
   Default (unset / 'tasks') loads the original Task Dashboard. */
const APP_MODE = import.meta.env.VITE_APP_MODE ?? 'tasks';

function TaskDashboard() {
  const [showInput, setShowInput] = useState(false);

  return (
    <TaskProvider>
      <TagProvider>
        <ListProvider>
          <div className="App min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col items-center py-12 px-4" data-testid="app">
            <div className="w-full max-w-6xl">
              <motion.div 
                className="mb-6 bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                data-testid="app-header"
              >
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">Task Dashboard</h1>
                </div>
                
                <AnimatePresence>
                  {showInput ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                      data-testid="task-form-container"
                    >
                      <GlobalTaskForm onCancel={() => setShowInput(false)} />
                    </motion.div>
                  ) : (
                    <motion.button
                      className="flex items-center justify-center w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                      onClick={() => setShowInput(true)}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      data-testid="show-task-form-button"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add New Task
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <TaskBoard />
            </div>
          </div>
        </ListProvider>
      </TagProvider>
    </TaskProvider>
  );
}

function App() {
  if (APP_MODE === 'gateway') {
    return <GatewayApp />;
  }
  return <TaskDashboard />;
}

export default App;
