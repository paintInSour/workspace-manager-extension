import React, { useState, useEffect } from 'react';
import { Card, List, Checkbox, Button, Typography, Input, message, Modal, Dropdown, Menu } from 'antd';
import { DeleteOutlined, HistoryOutlined, FilterTwoTone, PlusOutlined } from '@ant-design/icons';
import { TodoItem } from '../types';

const { Text } = Typography;

const TodoList: React.FC = () => {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [deletedTasks, setDeletedTasks] = useState<TodoItem[]>([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');

  // Load todo items when component mounts
  useEffect(() => {
    chrome.storage.local.get(['todolist', 'deletedTasks'], (result) => {
      if (result.todolist) {
        setTodoItems(result.todolist);
      }
      if (result.deletedTasks) {
        setDeletedTasks(result.deletedTasks);
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

  const saveDeletedTasks = (tasks: TodoItem[]) => {
    setDeletedTasks(tasks);
    chrome.storage.local.set({ deletedTasks: tasks });
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
      deletedAt: null, // Default to null
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
    const taskToDelete = todoItems.find(item => item.id === id);
    if (taskToDelete) {
      const now = new Date().toISOString();
      saveDeletedTasks([
        ...deletedTasks,
        { ...taskToDelete, deletedAt: now } // Add deletedAt field
      ]);
    }
    const updatedItems = todoItems.filter(item => item.id !== id);
    saveTodoItems(updatedItems);
    message.success('Task deleted successfully!');
  };

  // Restore task
  const restoreTask = (id: string) => {
    const taskToRestore = deletedTasks.find(item => item.id === id);
    if (taskToRestore) {
      saveDeletedTasks(deletedTasks.filter(item => item.id !== id)); // Remove from deleted tasks
      saveTodoItems([
        ...todoItems,
        { ...taskToRestore, deletedAt: null } // Reset deletedAt field
      ]);
      message.success('Task restored successfully!');
    }
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

  const groupDeletedTasksByDate = (tasks: TodoItem[]) => {
    const groupedTasks = tasks.reduce((groups, task) => {
      const dateKey = new Date(task.deletedAt!).toDateString(); // Use only the date part
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
      return groups;
    }, {} as Record<string, TodoItem[]>);

    // Sort the grouped dates in descending order
    return Object.entries(groupedTasks).sort(
      ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()
    );
  };

  const filteredDeletedTasks = deletedTasks.filter(task => {
    if (historyFilter === 'completed') return task.completed;
    if (historyFilter === 'uncompleted') return !task.completed;
    return true; // 'all' option
  });

  const filterMenu = (
    <Menu
      onClick={({ key }) => setHistoryFilter(key as 'all' | 'completed' | 'uncompleted')}
    >
      <Menu.Item key="all">Show All</Menu.Item>
      <Menu.Item key="completed">Only Completed</Menu.Item>
      <Menu.Item key="uncompleted">Only Uncompleted</Menu.Item>
    </Menu>
  );

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Todo List</span>
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => setIsHistoryModalVisible(true)} // Open the history modal
          />
        </div>
      }
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
        <Button
          type="primary"
          icon={<PlusOutlined />} // Use the PlusOutlined icon
          shape="circle" // Make the button round
          onClick={handleAddTask}
        />
      </div>
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Dropdown overlay={filterMenu} trigger={['click']}>
              <Button
                icon={<FilterTwoTone />}
                type="text"
                style={{ position: 'absolute', left: 0 }} // Apply style to the Button
              />
            </Dropdown>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>History</span>
          </div>
        }
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)} // Close the modal
        footer={null}
        style={{ top: 20, right: 0, position: 'absolute' }} // Position the modal to the right
        bodyStyle={{ maxHeight: '60%', overflowY: 'auto' }} // Scrollable content
      >
        {groupDeletedTasksByDate(filteredDeletedTasks).map(([date, tasks]) => (
          <div key={date} style={{ marginBottom: 16 }}>
            <Text strong>{date}</Text> {/* Group header */}
            <List
              dataSource={tasks}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  style={{
                    backgroundColor: item.completed ? '#f9f9f9' : 'inherit', // Light gray background for completed tasks
                    borderRadius: '4px', // Optional: Add rounded corners for better appearance
                    padding: '8px' // Optional: Add padding for better spacing
                  }}
                  actions={[
                    <Button
                      type="link"
                      onClick={() => restoreTask(item.id)} // Restore the task
                    >
                      Restore
                    </Button>
                  ]}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text>{item.text}</Text>
                    <Text type="secondary">Created: {formatDateTime(item.createdAt)}</Text>
                    {item.completedAt && (
                      <Text type="secondary">Completed: {formatDateTime(item.completedAt)}</Text>
                    )}
                    {item.deletedAt && (
                      <Text type="secondary">Deleted: {formatDateTime(item.deletedAt)}</Text>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>
        ))}
      </Modal>
    </Card>
  );
};

export default TodoList;