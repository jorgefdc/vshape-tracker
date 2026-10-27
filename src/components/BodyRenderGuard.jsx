import React from 'react';

export default class BodyRenderGuard extends React.Component {
 constructor(props){super(props);this.state={failed:false}}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error){console.error('Falha na visualização do avatar:',error)}
 render(){
  if(this.state.failed){
   return <div className="card"><p>Não foi possível carregar o avatar 3D neste dispositivo. As suas medidas continuam disponíveis abaixo.</p><button className="outline" onClick={()=>this.setState({failed:false})}>Tentar carregar novamente</button></div>;
  }
  return this.props.children;
 }
}
