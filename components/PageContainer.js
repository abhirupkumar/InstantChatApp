import { View } from 'react-native';
import React from 'react';

const PageContainer = props => {
    return (
        <View style={{
            flex: 1,
            paddingHorizontal: 20,
            backgroundColor: props.bgColor || "white",
        }}>
            {props.children}
        </View>
    )
}

export default PageContainer;

