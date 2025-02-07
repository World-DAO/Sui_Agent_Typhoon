import { useEffect, useState } from 'react';
import { EventBus } from '@/game/EventBus';
import DriftHome from '@/components/DriftHome';
import BottleDetails from '@/components/BottleDetails';

interface Bottle {
    title: string;
    body: string;
    author: string;
    time: Date;
    id: number;
}

export function HtmlOverlay() {
    // phaser scene state
    const [isDriftBottle, setIsDriftBottle] = useState<boolean>(false);

    // bottles
    const [bottles, setBottles] = useState<Bottle[]>([]);
    const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]);
    // bottle details
    const [selectedBottleId, setSelectedBottleId] = useState<number | null>(null);

    // UI
    const [htmlContent, setHtmlContent] = useState<string>('Hello World');
    const [htmlPosition, setHtmlPosition] = useState({ top: 300, left: 100 });
    const [htmlPositionDetail, setHtmlPositionDetail] = useState({ top: 300, left: 100 });

    // 监听更新HTML content
    useEffect(() => {
        EventBus.on('update-htmlcontent', (content: string) => {
            setHtmlContent(content);
        });
    
        return () => {
          EventBus.removeListener('update-htmlcontent');
        };
    }, []);

    // 监听更新HTML location
    useEffect(() => {
        EventBus.on('update-htmllocation', (position: { top: number; left: number }) => {
            setHtmlPosition(position);
        });
    
        return () => {
          EventBus.removeListener('update-htmllocation');
        };
    }, []);

    // 监听更新bottledetail HTML location
    useEffect(() => {
        EventBus.on('update-htmllocation-detail', (position: { top: number; left: number }) => {
            setHtmlPositionDetail(position);
        });
    
        return () => {
          EventBus.removeListener('update-htmllocation-detail');
        };
    }, []);

    // 监听漂流瓶窗口
    useEffect(() => {
        const handleSwitchScene = () => {
            setIsDriftBottle((prev) => !prev);
            setSelectedBottleId(null);
        }

        EventBus.on('switch-driftbottle-scene', handleSwitchScene); 

        return () => {
          EventBus.removeListener('switch-driftbottle-scene');
        };
    }, []);

    // 监听漂流瓶详情窗口
    useEffect(() => {
        const handleCloseDetailScene = () => {
            setSelectedBottleId(null)
        };

        EventBus.on('close-bottle-detail-scene', handleCloseDetailScene); 

        return () => {
          EventBus.removeListener('close-bottle-detail-scene');
        };
    }, []);

    if (!isDriftBottle) return null;

    return (
        <>
          {selectedBottleId === null ? (
            // 显示 列表 (DriftHome)
            <DriftHome
              htmlPosition={htmlPosition}
              htmlContent={htmlContent}
              onSelectBottle={(id) => setSelectedBottleId(id)}
              onSetBottles={(newBottles) => setBottles(newBottles)}
            />
          ) : (
            // 显示 详情
            <BottleDetails
              bottleId={selectedBottleId}
              bottles={bottles}
              onChangeBottleId={(newId) => setSelectedBottleId(newId)}
            />
          )}
        </>
      );
} 