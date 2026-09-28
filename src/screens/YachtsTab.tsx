import React from 'react';
import { CollectionTab, CollectionTabProps } from './CollectionTab';
import { YACHTS_DATA } from '../data/yachtsData';
export function YachtsTab(props: Omit<CollectionTabProps, 'data'>) { return <CollectionTab {...props} data={YACHTS_DATA} />; }
