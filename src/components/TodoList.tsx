import React, { useState, useEffect } from 'react';
import { Card, List, Checkbox, Button, Typography, Input, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TodoItem } from '../types';

const { Text } = Typography;

const TodoList: React.FC = () => {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Load todo items when component mounts
  useEffect(() => {
    chrome.storage.local.get(['todolist'], (result) => {
      if (result.todolist) {
        setTodoItems(result.todolist);
      }
    });
  }, []);

  // Save todo items when they change
  const saveTodoItems = (items: TodoItem[]) => {
    setTodoItems(items);
    chrome.runtime.sendMessage({
      action: 'saveData',
      dataType: 'todolist',
      data: items
    });
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTaskText.trim()) {
      message.warning('Please enter a task');
      return;
    }

    const now = new Date();
    const newTask: TodoItem = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      createdAt: now.toISOString(), // Store the full ISO string
      completedAt: null, // Default to null
      active: false
    };

    saveTodoItems([...todoItems, newTask]);
    setNewTaskText('');
    message.success('Task added successfully!');
  };

  // Toggle task completion status
  const toggleTaskComplete = (id: string) => {
    const updatedItems = todoItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : null // Save or reset the completed date
        };
      }
      return item;
    });

    saveTodoItems(updatedItems);
  };

  // Toggle active state (radio button behavior)
  const toggleTaskActive = (id: string) => {
    const updatedItems = todoItems.map(item => {
      if (item.id === id) {
        return { ...item, active: true };
      } else {
        return { ...item, active: false };
      }
    });

    saveTodoItems(updatedItems);
  };

  // Delete task
  const deleteTask = (id: string) => {
    const updatedItems = todoItems.filter(item => item.id !== id);
    saveTodoItems(updatedItems);
    message.success('Task deleted successfully!');
  };

  // Sort tasks: uncompleted first (by creation date), completed at the bottom
  const sortedTodoItems = [
    ...todoItems
      .filter(item => !item.completed) // Uncompleted tasks
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), // Sort by creation date (ascending)
    ...todoItems
      .filter(item => item.completed) // Completed tasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by creation date (ascending)
  ];

  const formatDateTime = (isoString: string) => {
    const now = new Date();
    const taskDate = new Date(isoString);

    const isToday = now.toDateString() === taskDate.toDateString(); // Check if the task was created today

    if (isToday) {
      return taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Show only time
    } else {
      return taskDate.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }); // Show date and time
    }
  };

  return (
    <Card
      title="Todo List"
      bordered={false}
      className="todolist-container"
      style={{
        width: '25%',
        backgroundColor: '#fffffe', // Milk white as per requirement
        borderRadius: '8px',
        boxShadow: 'none'
      }}
    >
      <List
        dataSource={sortedTodoItems}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <Button 
                icon={<DeleteOutlined />} 
                type="text" 
                danger 
                onClick={() => deleteTask(item.id)}
              />
            ]}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={item.completed}
                  onChange={() => toggleTaskComplete(item.id)}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: item.completed ? '#00000073' : 'inherit'
                  }}
                >
                  {item.text}
                </Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">
                  Created: {formatDateTime(item.createdAt)}
                </Text>
                {item.completed && item.completedAt && (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Completed: {formatDateTime(item.completedAt)}
                  </Text>
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
      <div style={{ display: 'flex', marginTop: 16 }}>
        <Input
          placeholder="Add a new task"
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          onPressEnter={handleAddTask}
          style={{ marginRight: 8 }}
        />
        <Button type="primary" onClick={handleAddTask}>
          +
        </Button>
      </div>
    </Card>
  );
};

export default TodoList;