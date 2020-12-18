import React, {useEffect} from 'react';
import { ComponentDidAppearEvent, Navigation, NavigationButtonPressedEvent } from "react-native-navigation";

export function useDidAppearListener(handler: (event: ComponentDidAppearEvent) => void, inputs: any[]) {
    useEffect(
        () => {
            const subsNBP = Navigation.events().registerComponentDidAppearListener(
                handler
            );

            return () => {
                subsNBP.remove();
            };
        },
        inputs
    );
}

export function useNavigationButtonPressedListener(handler: (event: NavigationButtonPressedEvent) => void, inputs: any[]) {
    useEffect(
        () => {
            const subsNBP = Navigation.events().registerNavigationButtonPressedListener(
                handler
            );

            return () => {
                subsNBP.remove();
            };
        },
        inputs
    );
}