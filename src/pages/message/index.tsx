import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { MessageType } from '@/types';
import { useAppStore } from '@/store';
import MessageItem from '@/components/MessageItem';
import classnames from 'classnames';
import styles from './index.module.scss';

type ViewMode = 'all' | 'todo';

const typeFilters: { key: MessageType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'overdue', label: '逾期' },
  { key: 'high_risk', label: '高风险' },
  { key: 'rectify', label: '整改' },
  { key: 'system', label: '系统' }
];

const todoTypes: MessageType[] = ['overdue', 'high_risk', 'rectify'];

const MessagePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [activeFilter, setActiveFilter] = useState<MessageType | 'all'>('all');
  const messages = useAppStore(s => s.messages);
  const markAllMessagesRead = useAppStore(s => s.markAllMessagesRead);
  const checkOverdue = useAppStore(s => s.checkOverdue);

  useDidShow(() => {
    useAppStore.getState();
    checkOverdue();
  });

  const todoMessages = useMemo(() => {
    return messages.filter(m => !m.read && todoTypes.includes(m.type));
  }, [messages]);

  const filteredList = useMemo(() => {
    const source = viewMode === 'todo' ? todoMessages : messages;
    if (activeFilter === 'all') return source;
    return source.filter(m => m.type === activeFilter);
  }, [activeFilter, messages, todoMessages, viewMode]);

  const unreadCount = messages.filter(m => !m.read).length;
  const todoCount = todoMessages.length;

  return (
    <View className={styles.container}>
      <View className={styles.viewModeBar}>
        <View
          className={classnames(styles.modeBtn, viewMode === 'all' && styles.modeBtnActive)}
          onClick={() => { setViewMode('all'); setActiveFilter('all'); }}
        >
          <Text className={classnames(styles.modeBtnText, viewMode === 'all' && styles.modeBtnTextActive)}>
            全部消息
          </Text>
        </View>
        <View
          className={classnames(styles.modeBtn, viewMode === 'todo' && styles.modeBtnActive)}
          onClick={() => { setViewMode('todo'); setActiveFilter('all'); }}
        >
          <Text className={classnames(styles.modeBtnText, viewMode === 'todo' && styles.modeBtnTextActive)}>
            待办任务
          </Text>
          {todoCount > 0 && (
            <View className={styles.todoBadge}>
              <Text className={styles.todoBadgeText}>{todoCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.filterBar}>
        {typeFilters.map(f => (
          <View
            key={f.key}
            className={classnames(styles.filterBtn, activeFilter === f.key && styles.filterBtnActive)}
            onClick={() => setActiveFilter(f.key)}
          >
            <Text className={classnames(styles.filterText, activeFilter === f.key && styles.filterTextActive)}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      {viewMode === 'all' && unreadCount > 0 && (
        <View className={styles.markAll} onClick={markAllMessagesRead}>
          <Text className={styles.markAllText}>全部标为已读（{unreadCount}条未读）</Text>
        </View>
      )}

      <View className={styles.list}>
        {filteredList.length > 0 ? (
          filteredList.map(item => <MessageItem key={item.id} data={item} />)
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>
              {viewMode === 'todo' ? '✅' : '📭'}
            </Text>
            <Text className={styles.emptyText}>
              {viewMode === 'todo' ? '暂无待办任务' : '暂无消息'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MessagePage;
