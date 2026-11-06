"""Cartoon choice art for the girlfriend this-or-that quizzes.

Each illustration concept in the researched batch maps to its own drawing.
Nothing here is a photograph or a stock video frame.
"""
import math
from PIL import Image, ImageDraw

S = 4


def _c(bg):
    im = Image.new("RGBA", (400 * S, 400 * S), bg + (255,))
    return im, ImageDraw.Draw(im)


def E(d, box, fill, outline=None, width=0):
    d.ellipse([v * S for v in box], fill=fill, outline=outline, width=width * S)


def R(d, box, fill, radius=0, outline=None, width=0):
    d.rounded_rectangle([v * S for v in box], radius * S, fill=fill, outline=outline, width=width * S)


def P(d, pts, fill, outline=None):
    d.polygon([(x * S, y * S) for x, y in pts], fill=fill, outline=outline)


def L(d, pts, fill, width):
    d.line([(x * S, y * S) for x, y in pts], fill=fill, width=width * S, joint="curve")


def finish(im):
    return im.resize((400, 400), Image.LANCZOS)


def _cup(d, drink, steam=True, ice=False, heart=False, tag=False):
    E(d, (70, 300, 330, 348), (255, 255, 255))
    if not ice:
        E(d, (268, 165, 338, 245), None, (255, 255, 255), 16)
    R(d, (100, 145, 290, 310), (255, 255, 255), 40)
    E(d, (112, 132, 278, 175), drink)
    if heart:
        P(d, [(190, 158), (200, 148), (210, 158), (200, 172)], (255, 170, 190))
    if tag:
        L(d, [(190, 145), (155, 195)], (80, 80, 80), 4)
        R(d, (132, 190, 178, 228), (230, 70, 70), 4)
    if steam:
        for x in (150, 195, 240):
            L(d, [(x, 120), (x + 10, 95), (x, 70)], (150, 110, 80), 8)
    if ice:
        R(d, (150, 70, 250, 150), (255, 255, 255), 16)
        E(d, (165, 85, 235, 140), drink)
        L(d, [(200, 55), (200, 88)], (180, 210, 230), 8)


RULES = []


def rule(*words):
    def wrap(fn):
        RULES.append((words, fn))
        return fn
    return wrap


@rule("teacup", "tea bag")
def tea(bg=(210, 235, 190)):
    im, d = _c(bg)
    _cup(d, (190, 140, 50), steam=True, tag=True)
    return finish(im)


@rule("latte foam", "steaming hot coffee", "hot coffee mug")
def coffee_hot(bg=(225, 200, 170)):
    im, d = _c(bg)
    _cup(d, (110, 60, 30), steam=True, heart=True)
    return finish(im)


@rule("iced coffee")
def coffee_iced(bg=(210, 230, 240)):
    im, d = _c(bg)
    _cup(d, (150, 90, 50), steam=False, ice=True)
    return finish(im)


@rule("pizza")
def pizza(bg=(255, 230, 190)):
    im, d = _c(bg)
    P(d, [(70, 300), (330, 300), (200, 70)], (240, 190, 70))
    P(d, [(95, 285), (305, 285), (200, 100)], (230, 70, 50))
    P(d, [(110, 270), (290, 270), (200, 120)], (255, 220, 120))
    for x, y in ((160, 200), (220, 180), (190, 240), (240, 230)):
        E(d, (x, y, x + 28, y + 28), (200, 40, 40))
    return finish(im)


@rule("taco")
def taco(bg=(255, 236, 200)):
    im, d = _c(bg)
    P(d, [(60, 170), (340, 170), (280, 320), (120, 320)], (240, 190, 80))
    P(d, [(90, 175), (310, 175), (260, 290), (140, 290)], (90, 160, 70))
    E(d, (150, 185, 200, 230), (220, 60, 50))
    E(d, (210, 190, 270, 240), (240, 200, 60))
    return finish(im)


@rule("pancakes")
def pancakes(bg=(255, 228, 190)):
    im, d = _c(bg)
    for y, col in ((250, (210, 140, 60)), (200, (230, 165, 80)), (150, (245, 190, 100))):
        E(d, (80, y, 320, y + 70), col)
    R(d, (175, 125, 230, 165), (255, 230, 120), 8)
    return finish(im)


@rule("waffle")
def waffle(bg=(255, 236, 200)):
    im, d = _c(bg)
    R(d, (70, 70, 330, 330), (220, 150, 60), 30)
    for i in range(1, 6):
        v = 70 + i * 260 / 6
        L(d, [(v, 90), (v, 310)], (170, 100, 30), 10)
        L(d, [(90, v), (310, v)], (170, 100, 30), 10)
    R(d, (170, 150, 230, 200), (255, 230, 140), 6)
    return finish(im)


@rule("french fries", "carton of golden")
def fries(bg=(255, 220, 140)):
    im, d = _c(bg)
    R(d, (110, 160, 290, 340), (220, 40, 40), 16)
    for x in (140, 175, 210, 245):
        R(d, (x, 70, x + 28, 190), (245, 200, 60), 8)
    return finish(im)


@rule("crunchy chips spilling", "bag of crunchy")
def chip_bag(bg=(250, 220, 160)):
    im, d = _c(bg)
    P(d, [(120, 40), (280, 40), (320, 340), (80, 340)], (200, 40, 50))
    R(d, (145, 70, 255, 130), (255, 220, 80), 8)
    for x, y in ((100, 250), (160, 300), (230, 280), (280, 320)):
        E(d, (x, y, x + 40, y + 22), (240, 190, 70))
    return finish(im)


@rule("bowl of crispy", "potato chips")
def chip_bowl(bg=(255, 230, 180)):
    im, d = _c(bg)
    E(d, (70, 180, 330, 330), (240, 240, 240))
    for x, y in ((110, 150), (170, 130), (230, 145), (200, 190)):
        E(d, (x, y, x + 55, y + 28), (230, 170, 50))
    return finish(im)


@rule("bar of chocolate")
def choc_bar(bg=(240, 200, 180)):
    im, d = _c(bg)
    R(d, (80, 90, 320, 310), (110, 55, 30), 16)
    for i in range(3):
        for j in range(4):
            R(d, (100 + j * 52, 110 + i * 60, 145 + j * 52, 160 + i * 60), (80, 40, 20), 6)
    return finish(im)


@rule("fancy chocolates", "box of fancy")
def choc_box(bg=(255, 210, 220)):
    im, d = _c(bg)
    R(d, (60, 120, 340, 320), (140, 40, 60), 18)
    for i, col in enumerate(((120, 60, 40), (200, 160, 80), (90, 40, 30), (180, 80, 90))):
        E(d, (90 + i * 60, 180, 140 + i * 60, 250), col)
    return finish(im)


@rule("sushi")
def sushi(bg=(255, 228, 220)):
    im, d = _c(bg)
    E(d, (50, 250, 350, 310), (240, 240, 240))
    for x, fill in ((80, (230, 80, 70)), (160, (80, 160, 80)), (240, (240, 180, 60))):
        E(d, (x, 150, x + 70, 230), (255, 255, 255))
        E(d, (x + 18, 168, x + 52, 210), fill)
    return finish(im)


@rule("burger")
def burger(bg=(255, 214, 180)):
    im, d = _c(bg)
    E(d, (70, 90, 330, 170), (210, 140, 50))
    R(d, (80, 160, 320, 200), (60, 150, 60), 8)
    R(d, (85, 195, 315, 235), (140, 70, 40), 8)
    E(d, (70, 225, 330, 310), (230, 170, 70))
    return finish(im)


@rule("hotdog")
def hotdog(bg=(255, 228, 190)):
    im, d = _c(bg)
    R(d, (50, 150, 350, 270), (230, 170, 70), 60)
    R(d, (70, 175, 330, 245), (190, 50, 40), 40)
    L(d, [(90, 200), (300, 210)], (230, 190, 40), 8)
    return finish(im)


@rule("strawberries")
def strawberries(bg=(255, 220, 220)):
    im, d = _c(bg)
    E(d, (80, 160, 320, 250), (255, 255, 255))
    for x in (110, 175, 240):
        P(d, [(x + 20, 90), (x, 180), (x + 50, 180)], (220, 40, 50))
        L(d, [(x + 20, 90), (x + 20, 70)], (40, 140, 50), 6)
    return finish(im)


@rule("raspberries")
def raspberries(bg=(255, 220, 230)):
    im, d = _c(bg)
    for x, y in ((120, 120), (200, 100), (250, 170), (160, 200)):
        E(d, (x, y, x + 70, y + 70), (190, 30, 70))
        for k in range(4):
            E(d, (x + 10 + k * 12, y + 20, x + 22 + k * 12, y + 32), (230, 80, 110))
    return finish(im)


@rule("layer cake", "frosted")
def cake(bg=(255, 220, 230)):
    im, d = _c(bg)
    R(d, (80, 200, 320, 250), (255, 170, 190), 8)
    R(d, (100, 150, 300, 200), (255, 200, 210), 8)
    R(d, (120, 110, 280, 155), (255, 230, 235), 8)
    E(d, (185, 70, 215, 115), (230, 60, 80))
    return finish(im)


@rule("lattice", "slice of pie")
def pie(bg=(255, 230, 200)):
    im, d = _c(bg)
    P(d, [(60, 250), (340, 250), (280, 90), (120, 90)], (230, 160, 70))
    for i in range(4):
        L(d, [(140 + i * 30, 110), (100 + i * 40, 240)], (245, 210, 140), 8)
    return finish(im)


@rule("chili", "flame")
def spicy(bg=(255, 220, 200)):
    im, d = _c(bg)
    for i, x in enumerate((110, 180, 250)):
        P(d, [(x, 260), (x + 50, 260), (x + 25, 120)], (220, 40, 30))
        P(d, [(x + 10, 150), (x + 40, 150), (x + 25, 80)], (255, 180, 40))
    return finish(im)


@rule("mild pasta", "pasta bowl")
def mild(bg=(255, 236, 210)):
    im, d = _c(bg)
    E(d, (70, 150, 330, 330), (245, 245, 245))
    for y in (190, 220, 250):
        L(d, [(110, y), (290, y + 10)], (240, 200, 80), 10)
    return finish(im)


@rule("ketchup")
def ketchup(bg=(255, 210, 200)):
    im, d = _c(bg)
    R(d, (150, 70, 250, 300), (200, 30, 30), 30)
    R(d, (170, 40, 230, 80), (180, 180, 180), 8)
    return finish(im)


@rule("ranch")
def ranch(bg=(230, 245, 220)):
    im, d = _c(bg)
    E(d, (90, 140, 310, 320), (255, 255, 255))
    E(d, (130, 180, 270, 280), (245, 245, 230))
    return finish(im)


@rule("eggs toast", "savory")
def savory(bg=(255, 236, 200)):
    im, d = _c(bg)
    R(d, (70, 180, 330, 250), (220, 160, 80), 12)
    E(d, (140, 120, 260, 230), (255, 230, 80))
    E(d, (180, 155, 220, 195), (230, 120, 40))
    return finish(im)


@rule("pastries", "sweet breakfast", "yogurt")
def sweet_breakfast(bg=(255, 228, 220)):
    im, d = _c(bg)
    E(d, (60, 200, 200, 330), (255, 180, 190))
    E(d, (180, 90, 340, 250), (245, 200, 120))
    E(d, (230, 130, 290, 190), (220, 60, 80))
    return finish(im)


@rule("buttery popcorn", "popcorn bucket")
def popcorn(bg=(255, 236, 180)):
    im, d = _c(bg)
    P(d, [(110, 160), (290, 160), (250, 340), (150, 340)], (220, 40, 40))
    for x, y in ((120, 90), (180, 70), (240, 100), (160, 130), (220, 140)):
        E(d, (x, y, x + 40, y + 30), (255, 240, 180))
    return finish(im)


@rule("caramel")
def caramel_popcorn(bg=(255, 220, 170)):
    im, d = _c(bg)
    for x, y in ((90, 120), (170, 90), (250, 130), (130, 200), (220, 210)):
        E(d, (x, y, x + 70, y + 55), (190, 110, 40))
    return finish(im)


@rule("pretzel")
def pretzel(bg=(255, 228, 180)):
    im, d = _c(bg)
    E(d, (80, 80, 320, 320), None, (190, 120, 40), 28)
    E(d, (140, 140, 260, 260), None, (190, 120, 40), 20)
    return finish(im)


@rule("street food", "skewers")
def street(bg=(255, 220, 190)):
    im, d = _c(bg)
    for y, col in ((120, (200, 60, 40)), (180, (230, 170, 60)), (240, (80, 150, 60))):
        L(d, [(80, y), (320, y)], (160, 110, 60), 8)
        E(d, (120, y - 22, 180, y + 22), col)
        E(d, (210, y - 22, 270, y + 22), col)
    return finish(im)


@rule("beach", "umbrella and waves")
def beach(bg=(170, 220, 245)):
    im, d = _c(bg)
    E(d, (40, 250, 360, 400), (240, 200, 110))
    E(d, (40, 220, 360, 280), (70, 160, 220))
    P(d, [(200, 80), (150, 200), (250, 200)], (230, 50, 70))
    L(d, [(200, 80), (200, 250)], (120, 80, 40), 8)
    return finish(im)


@rule("mountain", "hiking boots", "trail")
def mountains(bg=(190, 220, 245)):
    im, d = _c(bg)
    P(d, [(20, 300), (140, 120), (220, 300)], (90, 140, 90))
    P(d, [(160, 300), (280, 80), (380, 300)], (70, 110, 80))
    P(d, [(250, 110), (290, 80), (310, 140)], (255, 255, 255))
    return finish(im)


@rule("open highway", "road trip", "suitcase")
def road(bg=(200, 225, 245)):
    im, d = _c(bg)
    P(d, [(40, 300), (360, 300), (250, 160), (150, 160)], (80, 80, 80))
    L(d, [(200, 170), (200, 290)], (250, 210, 40), 8)
    R(d, (70, 200, 150, 250), (220, 50, 50), 10)
    E(d, (80, 240, 110, 270), (30, 30, 30))
    E(d, (120, 240, 150, 270), (30, 30, 30))
    return finish(im)


@rule("airplane", "plane window", "looking at clouds")
def plane(bg=(186, 220, 245)):
    im, d = _c(bg)
    P(d, [(40, 210), (300, 180), (340, 200), (300, 230), (40, 250)], (230, 230, 235))
    P(d, [(180, 200), (230, 120), (250, 200)], (200, 200, 210))
    return finish(im)


@rule("window seat")
def window_seat(bg=(190, 220, 240)):
    im, d = _c(bg)
    R(d, (90, 60, 310, 300), (60, 80, 110), 20)
    E(d, (120, 90, 280, 250), (140, 200, 240))
    E(d, (150, 140, 230, 190), (255, 255, 255))
    return finish(im)


@rule("aisle")
def aisle(bg=(220, 225, 235)):
    im, d = _c(bg)
    R(d, (60, 80, 160, 320), (70, 90, 140), 16)
    R(d, (240, 80, 340, 320), (70, 90, 140), 16)
    R(d, (170, 80, 230, 320), (230, 230, 230), 8)
    return finish(im)


@rule("itinerary", "checkmarks", "plan every")
def plan(bg=(230, 240, 255)):
    im, d = _c(bg)
    R(d, (100, 50, 300, 350), (255, 255, 255), 12)
    for i, y in enumerate((100, 160, 220, 280)):
        E(d, (120, y, 150, y + 30), (80, 170, 90))
        R(d, (170, y + 8, 270, y + 22), (180, 190, 210), 4)
    return finish(im)


@rule("compass", "wing it", "spontaneous")
def compass(bg=(255, 230, 190)):
    im, d = _c(bg)
    E(d, (70, 70, 330, 330), (255, 255, 255), (40, 40, 40), 8)
    P(d, [(200, 90), (230, 200), (200, 180), (170, 200)], (220, 40, 40))
    P(d, [(200, 310), (230, 200), (200, 220), (170, 200)], (40, 40, 40))
    return finish(im)


@rule("fancy hotel", "hotel lobby", "chandelier")
def hotel(bg=(235, 225, 250)):
    im, d = _c(bg)
    R(d, (80, 140, 320, 340), (250, 245, 255), 8, (80, 60, 120), 6)
    P(d, [(200, 40), (250, 140), (150, 140)], (230, 190, 60))
    for x in (170, 200, 230):
        E(d, (x - 8, 130, x + 8, 150), (255, 220, 80))
    return finish(im)


@rule("luxury hotel")
def luxury(bg=(230, 220, 250)):
    im, d = _c(bg)
    R(d, (90, 160, 310, 340), (80, 60, 120), 6)
    R(d, (140, 80, 260, 170), (255, 220, 120), 8)
    E(d, (175, 100, 225, 150), (255, 240, 180))
    return finish(im)


@rule("cabin", "fireplace")
def cabin(bg=(230, 210, 180)):
    im, d = _c(bg)
    P(d, [(40, 180), (200, 60), (360, 180)], (140, 50, 40))
    R(d, (90, 180, 310, 340), (150, 90, 50), 4)
    R(d, (170, 230, 230, 300), (255, 180, 60), 6)
    return finish(im)


@rule("camping", "tent", "starry")
def camping(bg=(30, 40, 80)):
    im, d = _c(bg)
    for x, y in ((60, 70), (120, 50), (300, 80), (250, 40)):
        E(d, (x, y, x + 8, y + 8), (255, 255, 255))
    P(d, [(80, 300), (200, 120), (320, 300)], (60, 120, 80))
    return finish(im)


@rule("cooking", "stove")
def cooking(bg=(255, 228, 200)):
    im, d = _c(bg)
    E(d, (80, 150, 320, 300), (80, 80, 90))
    E(d, (120, 90, 280, 200), (200, 50, 40))
    L(d, [(200, 40), (200, 100)], (160, 160, 170), 8)
    return finish(im)


@rule("takeout", "delivery bag")
def takeout(bg=(255, 220, 180)):
    im, d = _c(bg)
    P(d, [(140, 60), (260, 60), (300, 160), (100, 160)], (220, 50, 40))
    R(d, (110, 150, 290, 320), (240, 200, 140), 8)
    return finish(im)


@rule("sunrise")
def sunrise(bg=(255, 210, 160)):
    im, d = _c(bg)
    E(d, (40, 220, 360, 420), (255, 170, 80))
    E(d, (120, 140, 280, 300), (255, 200, 60))
    return finish(im)


@rule("sunset")
def sunset(bg=(255, 170, 120)):
    im, d = _c(bg)
    E(d, (40, 230, 360, 420), (90, 50, 90))
    E(d, (130, 150, 270, 290), (255, 120, 60))
    return finish(im)


@rule("picnic")
def picnic(bg=(190, 220, 160)):
    im, d = _c(bg)
    R(d, (50, 180, 350, 320), (220, 70, 70), 8)
    E(d, (140, 200, 260, 280), (240, 200, 80))
    E(d, (80, 90, 150, 160), (230, 80, 100))
    return finish(im)


@rule("rooftop")
def rooftop(bg=(40, 50, 90)):
    im, d = _c(bg)
    for i, h in enumerate((180, 240, 140, 200)):
        R(d, (40 + i * 80, 320 - h, 100 + i * 80, 320), (255, 200, 80), 2)
    R(d, (80, 200, 320, 250), (200, 40, 50), 6)
    return finish(im)


@rule("candlelit", "dinner at home", "home table")
def home_dinner(bg=(255, 220, 200)):
    im, d = _c(bg)
    R(d, (60, 220, 340, 260), (120, 70, 40), 4)
    E(d, (150, 150, 250, 230), (255, 255, 255))
    L(d, [(200, 90), (200, 140)], (255, 200, 80), 8)
    E(d, (185, 70, 215, 100), (255, 160, 40))
    return finish(im)


@rule("restaurant")
def restaurant(bg=(245, 230, 220)):
    im, d = _c(bg)
    R(d, (70, 200, 330, 250), (90, 50, 40), 4)
    E(d, (100, 140, 180, 210), (255, 255, 255))
    E(d, (220, 140, 300, 210), (255, 255, 255))
    L(d, [(140, 80), (140, 140)], (40, 40, 40), 6)
    return finish(im)


@rule("spa", "towels")
def spa(bg=(220, 245, 235)):
    im, d = _c(bg)
    R(d, (80, 160, 200, 320), (255, 255, 255), 12)
    R(d, (200, 140, 320, 300), (200, 230, 220), 12)
    E(d, (150, 70, 250, 140), (120, 200, 160))
    return finish(im)


@rule("hike", "adventure")
def hike(bg=(190, 220, 170)):
    im, d = _c(bg)
    P(d, [(40, 300), (200, 80), (360, 300)], (80, 130, 70))
    R(d, (170, 200, 230, 300), (90, 50, 30), 6)
    return finish(im)


@rule("museum", "gallery")
def museum(bg=(235, 230, 220)):
    im, d = _c(bg)
    R(d, (70, 80, 330, 280), (120, 90, 60), 8)
    R(d, (110, 110, 290, 230), (240, 220, 180), 4)
    R(d, (150, 270, 250, 340), (90, 90, 90), 4)
    return finish(im)


@rule("street food tours")
def street_tour(bg=(255, 220, 180)):
    return street((255, 220, 180))


@rule("big city", "skyline", "city night", "going out")
def city(bg=(30, 40, 80)):
    im, d = _c(bg)
    for i, h in enumerate((120, 200, 160, 240, 140)):
        R(d, (30 + i * 70, 330 - h, 90 + i * 70, 330), (255, 210, 80), 2)
    return finish(im)


@rule("tiny village", "cottages")
def village(bg=(200, 220, 170)):
    im, d = _c(bg)
    for x in (50, 160, 270):
        R(d, (x, 200, x + 80, 300), (230, 210, 170), 4)
        P(d, [(x - 10, 200), (x + 40, 140), (x + 90, 200)], (180, 60, 50))
    return finish(im)


@rule("long trip", "long itinerary")
def long_trip(bg=(210, 225, 245)):
    im, d = _c(bg)
    R(d, (80, 80, 200, 300), (40, 80, 150), 10)
    R(d, (210, 120, 330, 300), (200, 40, 50), 10)
    E(d, (120, 140, 160, 180), (240, 200, 80))
    return finish(im)


@rule("four mini suitcase", "weekend trips")
def weekends(bg=(230, 235, 250)):
    im, d = _c(bg)
    colors = ((220, 60, 60), (60, 120, 200), (240, 180, 40), (80, 160, 90))
    for i, col in enumerate(colors):
        x = 50 + (i % 2) * 160
        y = 50 + (i // 2) * 160
        R(d, (x, y, x + 120, y + 100), col, 10)
        L(d, [(x + 30, y), (x + 30, y - 20), (x + 90, y - 20), (x + 90, y)], (40, 40, 40), 6)
    return finish(im)


@rule("netflix")
def netflix(bg=(20, 20, 20)):
    im, d = _c(bg)
    # A bold red N, not a logo lockup copied from brand artwork beyond a letter.
    P(d, [(110, 60), (160, 60), (250, 340), (200, 340)], (229, 9, 20))
    P(d, [(250, 60), (290, 60), (200, 340), (160, 340)], (229, 9, 20))
    return finish(im)


@rule("youtube")
def youtube(bg=(255, 230, 230)):
    im, d = _c(bg)
    R(d, (40, 110, 360, 290), (220, 30, 30), 40)
    P(d, [(170, 150), (170, 250), (250, 200)], (255, 255, 255))
    return finish(im)


@rule("rom-com", "heart movie", "hearts and soft")
def romcom(bg=(255, 210, 220)):
    im, d = _c(bg)
    P(d, [(120, 180), (200, 120), (280, 180), (200, 300)], (230, 50, 80))
    R(d, (90, 220, 310, 250), (240, 200, 80), 4)
    return finish(im)


@rule("action", "explosion")
def action(bg=(40, 40, 50)):
    im, d = _c(bg)
    P(d, [(200, 40), (240, 150), (330, 160), (250, 210), (300, 330), (200, 250), (100, 330), (150, 210), (70, 160), (160, 150)], (255, 180, 40))
    return finish(im)


@rule("horror", "spooky", "ghost")
def horror(bg=(40, 30, 60)):
    im, d = _c(bg)
    E(d, (100, 60, 300, 260), (230, 230, 240))
    P(d, [(110, 200), (160, 340), (200, 220), (250, 340), (290, 200)], (230, 230, 240))
    E(d, (150, 130, 180, 160), (20, 20, 30))
    E(d, (220, 130, 250, 160), (20, 20, 30))
    return finish(im)


@rule("board game", "dice")
def board(bg=(230, 240, 220)):
    im, d = _c(bg)
    R(d, (70, 70, 250, 250), (60, 120, 70), 8)
    for x, y in ((110, 110), (180, 160), (130, 180)):
        E(d, (x, y, x + 22, y + 22), (255, 255, 255))
    R(d, (240, 220, 340, 320), (255, 255, 255), 12, (20, 20, 20), 4)
    E(d, (275, 255, 305, 285), (20, 20, 20))
    return finish(im)


@rule("video games", "controller", "neon")
def controller(bg=(230, 220, 250)):
    im, d = _c(bg)
    R(d, (50, 140, 350, 270), (50, 50, 70), 50)
    E(d, (90, 170, 150, 230), (80, 80, 100))
    E(d, (250, 165, 290, 205), (220, 50, 50))
    E(d, (300, 190, 340, 230), (60, 120, 220))
    return finish(im)


@rule("open book", "book")
def book(bg=(235, 225, 200)):
    im, d = _c(bg)
    P(d, [(40, 80), (190, 110), (190, 330), (40, 300)], (255, 250, 240))
    P(d, [(210, 110), (360, 80), (360, 300), (210, 330)], (255, 250, 240))
    L(d, [(200, 110), (200, 330)], (140, 40, 40), 8)
    return finish(im)


@rule("movie theater", "cinema", "clapper")
def theater(bg=(30, 30, 40)):
    im, d = _c(bg)
    R(d, (50, 70, 350, 250), (20, 20, 30), 8)
    R(d, (70, 90, 330, 220), (180, 40, 40), 4)
    for x in (60, 140, 230, 310):
        R(d, (x, 270, x + 40, 330), (180, 40, 50), 6)
    return finish(im)


@rule("couch", "binge", "episode tiles", "blankets")
def couch(bg=(230, 220, 240)):
    im, d = _c(bg)
    R(d, (40, 180, 360, 280), (90, 70, 150), 20)
    R(d, (50, 140, 110, 260), (90, 70, 150), 16)
    R(d, (290, 140, 350, 260), (90, 70, 150), 16)
    return finish(im)


@rule("one episode")
def one_episode(bg=(240, 240, 250)):
    im, d = _c(bg)
    R(d, (110, 70, 290, 250), (60, 90, 180), 12)
    P(d, [(170, 120), (170, 200), (240, 160)], (255, 255, 255))
    R(d, (140, 280, 260, 320), (220, 50, 60), 6)
    return finish(im)


@rule("singing", "karaoke")
def sing(bg=(250, 220, 240)):
    im, d = _c(bg)
    R(d, (160, 60, 230, 220), (40, 40, 50), 20)
    E(d, (145, 190, 245, 280), (40, 40, 50))
    L(d, [(250, 140), (320, 80)], (230, 60, 90), 8)
    return finish(im)


@rule("dancing", "dance shoes")
def dance(bg=(255, 220, 230)):
    im, d = _c(bg)
    P(d, [(80, 260), (180, 200), (200, 300)], (30, 30, 40))
    P(d, [(220, 250), (330, 180), (340, 280)], (180, 40, 70))
    return finish(im)


@rule("concerts", "stage lights")
def concert(bg=(20, 20, 40)):
    im, d = _c(bg)
    for x, col in ((80, (255, 60, 80)), (200, (80, 140, 255)), (300, (255, 200, 60))):
        P(d, [(x, 40), (x + 40, 40), (x + 20, 220)], col)
    E(d, (160, 230, 240, 320), (40, 40, 50))
    return finish(im)


@rule("comedy", "standup", "laugh")
def comedy(bg=(255, 236, 200)):
    im, d = _c(bg)
    E(d, (80, 80, 320, 320), (255, 220, 60))
    E(d, (140, 150, 180, 190), (20, 20, 20))
    E(d, (220, 150, 260, 190), (20, 20, 20))
    R(d, (150, 230, 250, 250), (20, 20, 20), 8)
    return finish(im)


@rule("podcast", "headphones")
def podcast(bg=(220, 230, 245)):
    im, d = _c(bg)
    E(d, (80, 100, 180, 220), (40, 40, 50))
    E(d, (220, 100, 320, 220), (40, 40, 50))
    L(d, [(130, 120), (200, 70), (270, 120)], (40, 40, 50), 16)
    return finish(im)


@rule("playlist", "music note", "love songs")
def playlist(bg=(235, 220, 250)):
    im, d = _c(bg)
    L(d, [(160, 80), (160, 260)], (80, 40, 140), 12)
    L(d, [(160, 80), (260, 120), (260, 200)], (80, 40, 140), 12)
    E(d, (110, 240, 190, 320), (80, 40, 140))
    E(d, (210, 180, 290, 260), (80, 40, 140))
    return finish(im)


@rule("night owl", "late night", "moon lamp")
def night(bg=(30, 40, 80)):
    im, d = _c(bg)
    E(d, (80, 60, 250, 230), (245, 230, 160))
    E(d, (130, 80, 260, 210), (30, 40, 80))
    return finish(im)


@rule("text", "chat bubbles", "phone text")
def texting(bg=(210, 225, 250)):
    im, d = _c(bg)
    R(d, (60, 80, 250, 180), (255, 255, 255), 30)
    R(d, (140, 200, 340, 300), (90, 150, 240), 30)
    return finish(im)


@rule("phone ringing", "call icon", "goodnight call")
def call(bg=(220, 245, 220)):
    im, d = _c(bg)
    R(d, (130, 40, 270, 360), (30, 30, 40), 30)
    E(d, (160, 80, 240, 160), (80, 180, 90))
    E(d, (175, 250, 225, 300), (80, 180, 90))
    return finish(im)


@rule("dogs", "cartoon dog")
def dog(bg=(210, 225, 245)):
    im, d = _c(bg)
    E(d, (90, 120, 310, 330), (190, 130, 70))
    E(d, (60, 80, 150, 200), (150, 90, 40))
    E(d, (250, 80, 340, 200), (150, 90, 40))
    E(d, (160, 180, 190, 210), (20, 20, 20))
    E(d, (220, 180, 250, 210), (20, 20, 20))
    return finish(im)


@rule("cats", "cartoon cat")
def cat(bg=(255, 220, 190)):
    im, d = _c(bg)
    E(d, (90, 130, 310, 330), (230, 140, 50))
    P(d, [(110, 160), (140, 60), (190, 140)], (230, 140, 50))
    P(d, [(290, 160), (260, 60), (210, 140)], (230, 140, 50))
    E(d, (160, 190, 185, 215), (20, 20, 20))
    E(d, (220, 190, 245, 215), (20, 20, 20))
    return finish(im)


@rule("hugs", "hug silhouette")
def hug(bg=(255, 220, 210)):
    im, d = _c(bg)
    E(d, (70, 80, 190, 200), (250, 200, 170))
    E(d, (190, 90, 330, 220), (230, 170, 150))
    R(d, (60, 180, 340, 320), (90, 120, 190), 40)
    return finish(im)


@rule("kisses", "kiss cheek")
def kisses(bg=(255, 210, 220)):
    im, d = _c(bg)
    P(d, [(80, 180), (200, 100), (250, 180), (160, 300)], (230, 50, 90))
    P(d, [(180, 160), (300, 90), (340, 180), (240, 280)], (255, 120, 150))
    return finish(im)


@rule("gold jewelry", "gold")
def gold(bg=(255, 230, 170)):
    im, d = _c(bg)
    E(d, (70, 140, 330, 280), None, (210, 160, 40), 16)
    E(d, (160, 60, 240, 160), (230, 180, 50))
    return finish(im)


@rule("silver")
def silver(bg=(220, 225, 230)):
    im, d = _c(bg)
    E(d, (70, 150, 330, 270), None, (180, 185, 190), 16)
    E(d, (160, 70, 240, 160), (200, 205, 210))
    return finish(im)


@rule("big spoon")
def big_spoon(bg=(230, 225, 245)):
    im, d = _c(bg)
    E(d, (40, 140, 180, 280), (90, 120, 190))
    E(d, (150, 160, 300, 270), (230, 150, 170))
    return finish(im)


@rule("little spoon")
def little_spoon(bg=(245, 225, 235)):
    im, d = _c(bg)
    E(d, (150, 140, 340, 280), (90, 120, 190))
    E(d, (70, 170, 200, 260), (230, 150, 170))
    return finish(im)


@rule("flowers", "bouquet")
def flowers(bg=(255, 220, 230)):
    im, d = _c(bg)
    for x, y, col in ((140, 120, (230, 60, 80)), (220, 100, (240, 160, 40)), (180, 180, (170, 80, 200))):
        L(d, [(x, y), (200, 320)], (50, 140, 60), 8)
        E(d, (x - 28, y - 28, x + 28, y + 28), col)
    return finish(im)


@rule("rain")
def rain(bg=(180, 200, 220)):
    im, d = _c(bg)
    P(d, [(80, 150), (200, 70), (320, 150)], (50, 70, 100))
    for x in (120, 180, 240, 300):
        L(d, [(x, 180), (x - 20, 300)], (80, 140, 200), 6)
    return finish(im)


@rule("snowflake", "snow", "winter", "mittens")
def snow(bg=(200, 225, 245)):
    im, d = _c(bg)
    for k in range(6):
        a = k * math.pi / 3
        L(d, [(200, 200), (200 + 120 * math.cos(a), 200 + 120 * math.sin(a))], (255, 255, 255), 10)
    return finish(im)


@rule("summer", "sunglasses", "sun ")
def sun(bg=(255, 220, 140)):
    im, d = _c(bg)
    E(d, (120, 120, 280, 280), (255, 190, 40))
    for k in range(8):
        a = k * math.pi / 4
        L(d, [(200 + 90 * math.cos(a), 200 + 90 * math.sin(a)), (200 + 140 * math.cos(a), 200 + 140 * math.sin(a))], (255, 160, 20), 10)
    return finish(im)


@rule("salty")
def salty(bg=(255, 230, 190)):
    return pretzel((255, 230, 190))


@rule("sweet")
def sweet(bg=(255, 220, 230)):
    im, d = _c(bg)
    R(d, (140, 80, 260, 200), (230, 70, 100), 20)
    E(d, (120, 180, 280, 320), (255, 180, 200))
    return finish(im)


@rule("night in", "friday night in", "private")
def night_in(bg=(235, 225, 245)):
    return couch((235, 225, 245))


@rule("night out", "friday night out")
def night_out(bg=(30, 30, 60)):
    return city((30, 30, 60))


@rule("gym", "dumbbell")
def gym(bg=(220, 230, 240)):
    im, d = _c(bg)
    R(d, (70, 170, 330, 210), (60, 60, 70), 8)
    E(d, (40, 130, 110, 250), (60, 60, 70))
    E(d, (290, 130, 360, 250), (60, 60, 70))
    return finish(im)


@rule("long walks", "walking shoes", "park path")
def walk(bg=(200, 220, 170)):
    im, d = _c(bg)
    L(d, [(40, 300), (200, 160), (360, 80)], (90, 140, 70), 16)
    E(d, (150, 200, 230, 250), (40, 40, 40))
    return finish(im)


@rule("morning shower")
def shower_am(bg=(255, 220, 170)):
    im, d = _c(bg)
    R(d, (120, 40, 280, 340), (180, 210, 230), 20)
    for y in (80, 130, 180):
        L(d, [(160, y), (150, y + 30)], (80, 140, 190), 6)
    E(d, (40, 40, 120, 120), (255, 190, 60))
    return finish(im)


@rule("night shower", "evening shower")
def shower_pm(bg=(40, 50, 90)):
    im, d = _c(bg)
    R(d, (120, 40, 280, 340), (160, 180, 210), 20)
    E(d, (250, 50, 340, 140), (230, 230, 180))
    return finish(im)


@rule("public affection", "holding hands", "busy street")
def public_aff(bg=(255, 220, 200)):
    im, d = _c(bg)
    E(d, (60, 80, 160, 180), (250, 200, 170))
    E(d, (220, 80, 330, 180), (230, 170, 150))
    R(d, (40, 220, 180, 320), (80, 110, 180), 20)
    R(d, (200, 220, 350, 320), (200, 60, 90), 20)
    return finish(im)


@rule("private moments", "cozy private")
def private(bg=(245, 225, 220)):
    im, d = _c(bg)
    R(d, (70, 80, 330, 300), (255, 236, 220), 16)
    E(d, (150, 140, 250, 240), (255, 180, 80))
    return finish(im)


@rule("surprise gift", "unexpected gift", "gift box")
def surprise(bg=(255, 220, 210)):
    im, d = _c(bg)
    R(d, (90, 160, 310, 320), (220, 50, 70), 8)
    R(d, (80, 130, 320, 180), (240, 80, 100), 6)
    L(d, [(200, 130), (200, 320)], (250, 210, 80), 10)
    return finish(im)


@rule("planned present", "calendar")
def planned(bg=(230, 240, 255)):
    im, d = _c(bg)
    R(d, (80, 70, 320, 330), (255, 255, 255), 8)
    R(d, (80, 70, 320, 120), (220, 50, 60), 8)
    E(d, (140, 180, 180, 220), (220, 50, 70))
    return finish(im)


@rule("love note", "handwritten", "envelope")
def note(bg=(255, 236, 220)):
    im, d = _c(bg)
    P(d, [(60, 140), (340, 140), (200, 280)], (255, 250, 240))
    R(d, (70, 150, 330, 300), (255, 250, 240), 4)
    P(d, [(90, 180), (200, 140), (310, 180)], (230, 70, 90))
    return finish(im)


@rule("jeans")
def jeans(bg=(220, 230, 245)):
    im, d = _c(bg)
    P(d, [(120, 60), (180, 60), (200, 340), (100, 340)], (50, 80, 160))
    P(d, [(220, 60), (280, 60), (300, 340), (200, 340)], (50, 80, 160))
    return finish(im)


@rule("sweatpants")
def sweatpants(bg=(235, 230, 240)):
    im, d = _c(bg)
    P(d, [(110, 70), (190, 70), (210, 340), (80, 340)], (90, 90, 110))
    P(d, [(210, 70), (290, 70), (320, 340), (190, 340)], (90, 90, 110))
    return finish(im)


@rule("sneakers")
def sneakers(bg=(230, 240, 255)):
    im, d = _c(bg)
    P(d, [(60, 220), (300, 200), (340, 250), (90, 290)], (230, 50, 70))
    L(d, [(120, 210), (150, 180), (190, 210)], (255, 255, 255), 6)
    return finish(im)


@rule("boots")
def boots(bg=(230, 220, 200)):
    im, d = _c(bg)
    P(d, [(140, 50), (230, 50), (250, 250), (200, 300), (120, 250)], (70, 45, 30))
    return finish(im)


@rule("matching outfits", "identical outfits")
def matching(bg=(240, 230, 250)):
    im, d = _c(bg)
    R(d, (60, 80, 180, 300), (90, 120, 200), 16)
    R(d, (220, 80, 340, 300), (90, 120, 200), 16)
    return finish(im)


@rule("coordinated", "color palette")
def colors(bg=(255, 230, 210)):
    im, d = _c(bg)
    E(d, (50, 80, 170, 200), (220, 50, 70))
    E(d, (150, 160, 270, 280), (240, 170, 50))
    E(d, (230, 70, 350, 190), (70, 120, 200))
    return finish(im)


@rule("instagram")
def instagram(bg=(255, 220, 210)):
    im, d = _c(bg)
    R(d, (70, 70, 330, 330), (255, 255, 255), 40, (200, 50, 100), 14)
    E(d, (130, 130, 270, 270), None, (200, 50, 100), 12)
    E(d, (250, 100, 280, 130), (200, 50, 100))
    return finish(im)


@rule("tiktok", "vertical video")
def tiktok(bg=(20, 20, 20)):
    im, d = _c(bg)
    # Two offset note shapes in the app's colors, drawn simply rather than traced.
    P(d, [(150, 70), (190, 70), (190, 250), (230, 270), (180, 270), (150, 240)], (37, 244, 238))
    P(d, [(190, 90), (230, 90), (230, 270), (270, 290), (220, 290), (190, 260)], (254, 44, 85))
    return finish(im)


@rule("remote", "sofa binge")
def remote(bg=(230, 225, 240)):
    im, d = _c(bg)
    R(d, (160, 40, 250, 340), (40, 40, 50), 20)
    for y in (80, 130, 180, 240):
        E(d, (185, y, 225, y + 30), (200, 40, 50))
    return finish(im)


def icon_for(illustration, label=""):
    text = f"{illustration} {label}".lower()
    best = None
    best_len = -1
    for words, fn in RULES:
        for word in words:
            if word in text and len(word) > best_len:
                best = fn
                best_len = len(word)
    if best is None:
        raise KeyError(f"No cartoon for {illustration!r} / {label!r}")
    return best()
