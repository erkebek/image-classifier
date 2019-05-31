import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Picker,
} from 'react-native';
import {
  RNCamera
} from 'react-native-camera-tflite';
import outputs from './Output.json';
import _ from 'lodash';

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      time: 0,
      output: "",
      selected: -1
    };
  }

  processOutput({data}){
    console.log(data);
    // const probs = _.map(data, item => _.round(item/255.0, .02));
    const orderedData = _.chain(data).zip(outputs)
      .orderBy(0, 'desc')
      .map(item => [_.round(item[0]/255, 2), item[1]]).value();
    const outputData = _.chain(orderedData).take(3).map(item => `${item[1]} - ${item[0]*100}%`).join("\n").value();
    const output = `${outputData}`;
    this.setState(state => ({
      output
    }));
  }

  processOutputIsSelected({data}){
    const {selected} = this.state;
    const isSelectedProb = data[selected];
    const isSelected = isSelectedProb > 0.2 ? `${outputs[selected]}` : `${outputs[selected]} эмес`;
    const output = `${isSelected}`;
    this.setState(state => ({
      output
    }));
  }

  render(){
    const modelParams = {
      file: "mobilenet_v1_1.0_224_quant.tflite",
      inputDimX: 224,
      inputDimY: 224,
      outputDim: 1001,
      freqms: 5
    };
    return(
      <View style={styles.container}>
        <RNCamera
          ref={ref => this.camera = ref}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.auto}
          permissionDialogTitle="Уруксат берүү"
          permissionDialogMessage="Бол эми бербейсиңби уруксат"
          onModelProcessed={data => {
            if(this.state.selected == -1){
              this.processOutput(data);
            }else{
              this.processOutputIsSelected(data);
            }
          }}
          modelParams={modelParams}
          />
        <View style={styles.textCont}>
            <Text style={styles.text}>Жыйынтык:</Text>
            <Text style={styles.text}>{this.state.output}</Text>
        </View>
        <View style={styles.pickerCont}>
          <Picker
            selectedValue={this.state.selected}
            onValueChange={selected => this.setState({selected})}>
            <Picker.Item label="Бардыгы" value={-1} />
            {
              outputs.map((v,i) => (
                <Picker.Item key={i} label={v} value={i} />
              ))
            }
          </Picker>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  preview: {
    flex: 2,
  },
  textCont: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    backgroundColor: '#fff'
    // alignItems: 'center'
  },
  textTitle: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold'
  }, 
  text: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold'
  },
  pickerCont: {
    flex: .3,
    padding: 15,
    backgroundColor: '#fff'
  }
});