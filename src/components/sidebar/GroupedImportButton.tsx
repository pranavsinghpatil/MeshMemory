import React, { useState } from 'react';
import { Button, Tooltip, Modal, Form, Input, Upload, message } from 'antd';
import { UploadOutlined, MergeCellsOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { UploadFile } from 'antd/lib/upload/interface';

const GroupedImportButton: React.FC = () => {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);

  // Color palette based on theme
  const colors = theme === 'dark'
    ? { primary: '#333446', secondary: '#7F8CAA', accent: '#B8CFCE', text: '#EAEFEF' }
    : { primary: '#E7EFC7', secondary: '#AEC8A4', accent: '#8A784E', text: '#3B3B1A' };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
    setGroupId(null);
  };

  const handleUpload = async (file: UploadFile) => {
    try {
      setUploading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file as any);
      formData.append('title', form.getFieldValue('title') || 'Grouped Import');
      formData.append('source_type', form.getFieldValue('sourceType') || 'other');
      
      // If we have a groupId, this is part of a group import
      if (groupId) {
        formData.append('group_id', groupId);
      }
      
      // Make API call to backend
      const response = await fetch('/api/imports', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      // If this is the first file in a group, save the artefact_id as groupId
      if (!groupId && data.artefact_id) {
        setGroupId(data.artefact_id);
        message.success('First file imported successfully! You can add more files to this group.');
      } else {
        message.success('File added to group import!');
      }
      
      // Remove the file from the list
      setFileList(prev => prev.filter(item => item.uid !== file.uid));
      
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = async () => {
    if (fileList.length === 0) {
      message.warning('Please add at least one file');
      return;
    }
    
    // Upload each file in sequence
    for (const file of fileList) {
      await handleUpload(file);
    }
    
    // Reset after all uploads
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
    setGroupId(null);
    message.success('Grouped import completed successfully!');
  };

  const buttonStyle = {
    backgroundColor: colors.primary,
    color: colors.text,
    border: 'none',
    marginBottom: '8px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  };

  return (
    <>
      <Tooltip title="Import multiple files as a group">
        <Button 
          icon={<MergeCellsOutlined />} 
          onClick={showModal}
          style={buttonStyle}
        >
          Grouped Import
        </Button>
      </Tooltip>
      
      <Modal
        title="Grouped Import"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleFinish}
        okText={groupId ? "Complete Import" : "Start Import"}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="title" 
            label="Group Title" 
            rules={[{ required: true, message: 'Please enter a title for this group' }]}
          >
            <Input placeholder="Enter a title for this grouped import" />
          </Form.Item>
          
          <Form.Item 
            name="sourceType" 
            label="Source Type" 
            initialValue="other"
          >
            <Input placeholder="Type of content (e.g., chatgpt, claude, etc.)" />
          </Form.Item>
          
          <Form.Item label="Files">
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList(prev => [...prev, file]);
                return false;
              }}
              onRemove={(file) => {
                setFileList(prev => prev.filter(item => item.uid !== file.uid));
              }}
            >
              <Button icon={<UploadOutlined />}>Add Files</Button>
            </Upload>
            {groupId && (
              <div style={{ marginTop: 8, color: colors.accent }}>
                Group ID: {groupId} - Continue adding files to this group
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GroupedImportButton;
