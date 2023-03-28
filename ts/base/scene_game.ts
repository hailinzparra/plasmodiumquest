class Ball extends CoreObject {
    r: number
    vx: number = 0
    vy: number = 0
    ax: number = 0
    ay: number = 0
    xs: number = 1
    ys: number = 1
    image_name: string
    constructor(image_name: string, x: number, y: number, r: number) {
        super(x, y)
        this.r = r
        this.image_name = image_name
        this.xs = (this.r * 2) / draw.strips[this.image_name].image_width
        this.ys = this.xs
    }
    get_direction() {
        return Math.atan2(this.vy, this.vx)
    }
    is_overlap(target: Ball) {
        return Math.hypot(target.x - this.x, target.y - this.y) <= (this.r + target.r)
    }
    render() {
        draw.strip_transformed(this.image_name, this.id % draw.strips[this.image_name].image_number, this.x, this.y, this.xs, this.ys, this.get_direction() * draw.RAD_TO_DEG)

        // const d = this.get_direction()
        // draw.circle(this.x, this.y, this.r, true)
        // draw.line(this.x, this.y, this.x + Math.cos(d) * this.r, this.y + Math.sin(d) * this.r)
    }
}

obj.add_name('ball')

class Basket extends CoreObject {
    w: number
    h: number
    image_name: string
    constructor(image_name: string, x: number, y: number, w: number, h: number) {
        super(x, y)
        this.depth = -1
        this.image_name = image_name
        this.w = w
        this.h = h
    }
    is_mouse_enter() {
        return input.mouse_x > this.x && input.mouse_x < this.x + this.w
            && input.mouse_y > this.y && input.mouse_y < this.y + this.h
    }
    render() {
        draw.set_color('white')
        draw.rect(this.x, this.y, this.w, this.h)
        draw.set_color('black')
        draw.draw(true)

        draw.set_font(font.m)
        draw.set_color('black')
        draw.set_hvalign('center', 'middle')
        draw.text(this.x + this.w / 2, this.y + this.h / 2, this.image_name)

        if (this.is_mouse_enter()) {
            draw.set_color('black')
            draw.set_alpha(0.3)
            draw.rect(this.x, this.y, this.w, this.h)
            draw.reset_alpha()
        }
    }
}

obj.add_name('basket')

const scene_game = new CoreScene()

let selected_ball: Ball | null = null
const selected_offset = {
    x: 0,
    y: 0,
}

scene_game.start = () => {
    const default_r = 32
    const names = ['falciparum', 'malariae']
    for (let i = 0; i < 150; i++) {
        const n = new Ball(
            names[Math.floor(Math.random() * names.length)],
            stage.w * 0.25,
            stage.h * 0.5,
            default_r,
        )
        let is_no_overlap = true
        let iter = 1
        while (iter-- > 0) {
            n.x = stage.get_random_x()
            n.y = stage.get_random_y()
            // for (const ball of (obj.take('ball') as Ball[])) {
            //     if (ball.id !== n.id && ball.is_overlap(n)) {
            //         is_no_overlap = false
            //         break
            //     }
            // }
        }
        if (is_no_overlap) {
            console.log
            obj.instantiate('ball', n)
        }
    }

    const basket_w = stage.w / 2
    const basket_h = 120
    obj.instantiate('basket', new Basket('falciparum', 0, 0, basket_w, basket_h))
    obj.instantiate('basket', new Basket('malariae', basket_w, 0, basket_w, basket_h))
}

scene_game.update = () => {
    if (input.mouse_down(0)) {
        selected_ball = obj.nearest('ball', input.x, input.y) as Ball
        if (selected_ball) {
            const distance_to_mouse = Math.hypot(input.x - selected_ball.x, input.y - selected_ball.y)
            if (distance_to_mouse <= selected_ball.r) {
                selected_offset.x = selected_ball.x - input.x
                selected_offset.y = selected_ball.y - input.y
            }
            else {
                selected_ball = null
            }
        }
    }

    if (input.mouse_hold(0)) {
        if (selected_ball) {
            selected_ball.x = input.x + selected_offset.x
            selected_ball.y = input.y + selected_offset.y
            selected_ball.depth = -2
        }
    }

    const balls = obj.take('ball') as Ball[]
    for (const ball of balls) {
        for (const target of balls) {
            if (target.id !== ball.id) {
                if (ball.is_overlap(target)) {
                    const distance = Math.hypot(target.x - ball.x, target.y - ball.y)
                    const overlap = 0.5 * (distance - ball.r - target.r)
                    ball.x += overlap * (target.x - ball.x) / distance
                    ball.y += overlap * (target.y - ball.y) / distance
                    target.x -= overlap * (target.x - ball.x) / distance
                    target.y -= overlap * (target.y - ball.y) / distance
                }
            }
        }
    }
}

scene_game.render = () => {
    // box_
}
