import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MessageItem as MessageItemType } from '@/types';
import { messageTypeMap } from '@/data/message';
import classnames from 'classnames';
import styles from './index.module.scss';

interface MessageItemProps {
  data: MessageItemType;
}

const priorityIconMap: Record<string, string> = {
  urgent: '🔴',
  important: '🟠',
  normal: '🔵'
};

const MessageItem: React.FC<MessageItemProps> = ({ data }) => {
  const handleClick = () => {
    if (data.relatedId) {
      if (data.relatedId.startsWith('HZ')) {
        Taro.navigateTo({ url: `/pages/hazard/detail/index?id=${data.relatedId}` });
      } else if (data.relatedId.startsWith('EQ')) {
        Taro.navigateTo({ url: `/pages/equipment/index?id=${data.relatedId}` });
      }
    }
  };

  return (
    <View
      className={classnames(styles.item, !data.read && styles.itemUnread)}
      onClick={handleClick}
    >
      <View className={styles.icon}>
        <Text className={styles.iconText}>{priorityIconMap[data.priority]}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={classnames(styles.title, !data.read && styles.titleUnread)}>
            {data.title}
          </Text>
          <View className={classnames(styles.typeTag, styles[`type${data.type.charAt(0).toUpperCase()}${data.type.slice(1)}`])}>
            <Text className={styles.typeText}>{messageTypeMap[data.type]}</Text>
          </View>
        </View>
        <Text className={styles.desc}>{data.content}</Text>
        <Text className={styles.time}>{data.time}</Text>
      </View>
    </View>
  );
};

export default MessageItem;
