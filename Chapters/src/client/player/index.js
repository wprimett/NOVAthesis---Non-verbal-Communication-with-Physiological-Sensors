import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
import serviceViews from '../shared/serviceViews';

// application specific services
import Salesman from '../shared/services/Salesman';
import ColorPicker from '../shared/services/ColorPicker';

// const io = require('socket.io-client')
// const port = 8000;
// console.log(port)
//
// const socket = io('http://localhost:' + port);
//
// function send () {
//   last = new Date();
//   socket.emit('ping_from_client');
// }
//
// socket.on('connect', () => {
//   console.log(`connect ${socket.id}`);
//   send();
// });
//
// socket.on('disconnect', () => {
//   console.log(`disconnect ${socket.id}`);
// });

window.addEventListener('load', () => {
  document.body.classList.remove('loading');

  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id)) {
      if (id === 'service:platform')
        instance.view = serviceViews.get('service:platform-player', config);
      else
        instance.view = serviceViews.get(id, config);
    }
  });

  const experience = new PlayerExperience(config.assetsDomain, config.geolocation);
  soundworks.client.start();
});
