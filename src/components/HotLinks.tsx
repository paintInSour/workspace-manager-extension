import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Row, Col, Modal, Form, Input, message, Space } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'; // Import CloseOutlined icon
import { HotLink } from '../types';

const HotLinks: React.FC = () => {
    const [hotLinks, setHotLinks] = useState<HotLink[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Load hotlinks when component mounts
    useEffect(() => {
        chrome.storage.local.get(['hotlinks'], (result) => {
            if (result.hotlinks) {
                setHotLinks(result.hotlinks);
            }
        });
    }, []);

    // Save hotlinks when they change
    const saveHotLinks = (links: HotLink[]) => {
        setHotLinks(links);
        chrome.runtime.sendMessage({
            action: 'saveData',
            dataType: 'hotlinks',
            data: links
        });
    };

    // Open link in a new tab
    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    // Remove a hotlink
    const removeHotLink = (id: string) => {
        const updatedHotLinks = hotLinks.filter(link => link.id !== id);
        saveHotLinks(updatedHotLinks);
        message.success('HotLink removed successfully!');
    };

    // Add new hotlink
    const handleAddHotLink = () => {
        form.validateFields()
            .then(values => {
                const newLink: HotLink = {
                    id: Date.now().toString(),
                    name: values.name || '', // Default to an empty string if no name is provided
                    url: values.url.startsWith('http') ? values.url : `https://${values.url}`,
                    iconUrl: values.iconUrl || `https://www.google.com/s2/favicons?sz=48&domain=${values.url}`
                };
                saveHotLinks([...hotLinks, newLink]);
                setIsModalVisible(false);
                form.resetFields();
                message.success('HotLink added successfully!');
            })
            .catch(() => {
                message.error('Failed to add HotLink. Please check the form values.');
            });
    };

    return (
        <Card
            title="HotLinks"
            bordered={false}
            className="hotlinks-container"
            style={{
                width: '30%',
                backgroundColor: '#fffffe',
                borderRadius: '8px',
                boxShadow: 'none'
            }}
        >
            <Space wrap size={[16, 16]} className="hotlinks-space">
                {hotLinks.map(link => (
                    <div key={link.id} className="hotlink-item" onClick={() => openLink(link.url)}>
                        {/* Remove Button */}
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent click event
                                removeHotLink(link.id);
                            }}
                            className="remove-button"
                        />
                        <Avatar
                            size={48}
                            src={link.iconUrl}
                            shape="square"
                            className="avatar"
                        />
                        {/* Conditionally render the name */}
                        {link.name && (
                            <div
                                className="name"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the parent click event
                                    openLink(link.url);
                                }}
                            >
                                {link.name}
                            </div>
                        )}
                    </div>
                ))}
                <div className="add-hotlink" onClick={() => setIsModalVisible(true)}>
                    <Button
                        type="dashed"
                        shape="circle"
                        icon={<PlusOutlined />}
                        size="large"
                        className="avatar"
                    />
                    <div className="name">Add</div>
                </div>
            </Space>

            <Modal
                title="Add New HotLink"
                open={isModalVisible}
                onOk={handleAddHotLink}
                onCancel={() => setIsModalVisible(false)}
                getContainer={false}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="url"
                        label="URL"
                        rules={[{ required: true, message: 'Please enter a URL' }]}
                    >
                        <Input placeholder="Enter URL" autoFocus />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Name"
                    >
                        <Input placeholder="Enter name (optional)" />
                    </Form.Item>

                    <Form.Item
                        name="iconUrl"
                        label="Custom Icon URL (optional)"
                    >
                        <Input placeholder="Enter icon URL (optional)" />
                    </Form.Item>
                </Form>
            </Modal>

            <style>
                {`
                    .hotlinks-space {
                        display: flex;
                        flex-wrap: wrap; /* Allow wrapping */
                        justify-content: flex-start; /* Align items to the start */
                    }

                    .hotlink-item, .add-hotlink {
                        position: relative;
                        text-align: center;
                        cursor: pointer;
                        border: 1px solid #f0f0f0;
                        border-radius: 20px;
                        padding: 3px;
                        width: 80px; /* Fixed width */
                        height: 80px; /* Fixed height */
                        box-sizing: border-box; /* Include padding and border in dimensions */
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        z-index: 1;
                        user-select: none; /* Prevent text selection for the entire hotlink item */
                    }

                    .hotlink-item .remove-button {
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background-color: #f0f0f0;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                        opacity: 0;
                        transition: opacity 0.2s ease-in-out;
                    }

                    .hotlink-item:hover .remove-button {
                        opacity: 1;
                    }

                    .hotlink-item .avatar, .add-hotlink .avatar {
                        margin: 0 auto 2px;
                    }

                    .hotlink-item .name, .add-hotlink .name {
                        font-size: 12px;
                        word-wrap: break-word;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%; /* Ensure the name fits within the component */
                        user-select: none; /* Prevent text selection for the name */
                    }

                    .hotlink-item:hover .name {
                        overflow: visible;
                        white-space: normal;
                        background-color: #fff;
                        position: absolute;
                        z-index: 9999;
                        padding: 2px 4px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        top: 80%; /* Position the tooltip below the component */
                        left: 50%; /* Center the tooltip horizontally */
                        transform: translateX(-50%); /* Adjust for centering */
                        margin-top: 4px; /* Add spacing between the component and the tooltip */
                        max-width: none; /* Remove width limitation */
                        white-space: nowrap;
                        user-select: none; /* Prevent text selection for the tooltip */
                        cursor: pointer; /* Show pointer cursor */
                    }
                `}
            </style>
        </Card>
    );
};

export default HotLinks;