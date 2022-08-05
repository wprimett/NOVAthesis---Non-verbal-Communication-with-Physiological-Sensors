import { Service, serviceManager, SegmentedView, client } from 'soundworks/client';
import please from 'pleasejs';


const SERVICE_ID = 'service:color-picker';

// const template = `
//   <div class="section-top flex-middle">
//     <p class="small">Choose your color</p>
//   </div>
//   <div class="section-center flex-center">
//     <div class="color-wrapper">
//       <% for (var i = 0; i < 4; i++) { %>
//       <div class="circle color"></div>
//       <% } %>
//       <div class="circle color-change"></div>
//     </div>
//   </div>
//   <div class="section-bottom"></div>
// `;

const template = `
<style>
  .circle {
    width: 50%;
    height: 50%;
    vertical-align: middle;
    border-radius: 50%;
    font-size: 50px;
    color: #FFF;
    text-align: center;
    padding-top: 0%;
  }
</style>

  <div class="section-top flex-middle">
    <p class="big">Choose a color</p>
  </div>
  <div class="section-center flex-center">
    <div class="color-wrapper">
      <% for (var i = 0; i < 4; i++) { %>
        <div class="circle color"> <b> <%= i %> </b> </div>
      <% } %>
    </div>
  </div>
  <div class="section-bottom"></div>
`;

class ColorPickerView extends SegmentedView {
  constructor(template, model, events, options) {
    super(template, model, events, options);

    this._updatePalette = this._updatePalette.bind(this);

    this.installEvents({
      'click .color-change': (e) => {
        e.target.classList.add('active');
        this._updatePalette();
      }
    });
  }

  onRender() {
    super.onRender();

    this.$colorWrapper = this.$el.querySelector('.color-wrapper');
    this.$circles = Array.from(this.$el.querySelectorAll('.circle'));
    this._updatePalette();
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

    let size;

    if (orientation === 'portrait' || true) {
      const nbrX = 2;
      const nbrY = 2;

      const bcr = this.$colorWrapper.getBoundingClientRect();
      const width = bcr.width;
      const height = bcr.height;

      size = Math.min(width / nbrX, height / nbrY);
    }

    this.$circles.forEach(($circle) => {
      $circle.style.width = `${size}px`;
      $circle.style.height = `${size}px`;
    });
  }

  _updatePalette() {
    var numCircles = 4;
    const $circles = this.$circles;
      // const colors = please.make_color({
    //   colors_returned: 4, //ADSE limit colors
    //   format: 'rgb-string',
    //   saturation: .75,
    //   value: .75,
    // });

    const colors = [
      "rgb(216,10,48)",
      "rgb(255,204,75)",
      "rgb(22,147,164)",
      "rgb(255,192,203)"
    ];

    // const colors = [
    //   "rgb(216,10,48)",
    //   "rgb(20,20,20)",
    //   "rgb(22,147,164)",
    //   "rgb(255,192,203)"
    // ];
    for (let i = 0; i < numCircles; i++) {
      const $circle = $circles[i];
      const color = colors[i];

      $circle.style.backgroundColor = color;
      $circle.setAttribute('data-rgb', color);
      $circle.setAttribute('id', i);
    }
  }
}

class ColorPicker extends Service {
  constructor() {
    super(SERVICE_ID);

    this._onSelectColor = this._onSelectColor.bind(this);
  }

  start() {
    super.start();

    this.options.viewPriority = 4;

    this.view = new ColorPickerView(template, {}, {
      'touchstart .color': this._onSelectColor,
      'mousedown .color': this._onSelectColor,
    }, {
      id: 'service-color-picker',
      ratios: {
        '.section-top': 0.12,
        '.section-center': 0.85,
        '.section-bottom': 0.03,
      },
    });

    this.show();
  }

  stop() {
    super.stop();

    this.hide();
  }

  _onSelectColor(e) {
    e.preventDefault();
    e.stopPropagation();

    // if (e.target.getAttribute('id') != 1){
      client.color = e.target.getAttribute('data-rgb');
      client.colorID = e.target.getAttribute('id');

      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const user_access_code = urlParams.get('recorder')

      if (user_access_code === "true"){
        client.colorID = 5;
        //   client.colorID = this.$circles.length + 1;
      }
      console.log(client.colorID);

      this.ready();
    // }
  }
}

serviceManager.register(SERVICE_ID, ColorPicker);

export default ColorPicker;
