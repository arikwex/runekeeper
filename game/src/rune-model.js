import base64_encoded_model from "../../rune-classifier/base64_encoded_model.txt"
/*
PATCH_FEATURES = 13
PATCH_FEATURES_DEEP = 13
NUM_CLASSES = 13

28x28 image => 16 patches of 7x7
7x7 patch uses W0 to become patch features
[W0][W0][W0][W0]
[W0][W0][W0][W0]
[W0][W0][W0][W0]
[W0][W0][W0][W0]

4x4 patches use W1 to become deeper patch features
[  W1  ][  W1  ]
[      ][      ]
[  W1  ][  W1  ]
[      ][      ]

Fully connected predicts 4 deep patches of features to output class
[0, 1, 2, 3, 4, 5...]

Memory Layout:
_________________________________________________
|    w0    | b0 |    w1    | b1 |    w2    | b2 |
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
w0 = 7^2 * PATCH_FEATURES
b0 = PATCH_FEATURES
w1 = 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP
b1 = PATCH_FEATURES_DEEP
w1 = 4 * PATCH_FEATURES_DEEP * NUM_CLASSES
b1 = NUM_CLASSES
*/

const encodedWeights = atob(base64_encoded_model) ;//'eYaHmIiJiLmKiajMm4nK7Yumy6xpq7p5hnap/nl4yI93htuHd8p9d5eriJepeIiIiXiImoeJmbmJmMp8mavch6nKfqjbrGa4zaqquap3h5mJiIiIh5iIqZmYiJiYZ5aKd2irmqqemJnaiZi6jXinmGd2mVd4mFdWhXliM7erZ4a7ipm4q5mau6mImWibmWjUqolmeIh3iIiIl5iIh3mHiYiIiIeHiXmId4h3t3hmh5xWdshqRFacVma0mpqIu6ycyd2ryt2+msrtm4ndrpjI3YlnyZt2hplYdnl5ZpeXyquIupyKiKqrmLm7bHfK3HV3u1tVyKyYipl5mIiIiYl4tphoVqt4aLWbZ1bdeleUaHeomId3eYhodod4eIiZmpiYqquduKvrrIiI15qpms2Jusmrqqu7q5mpu5mImnlWZmWp/HeFp3x2dsmHhoiJeXhniJhWlolWVqh4rYeIjvh4lompamqZeIhXqYm4d1eFdNlIjGiYlqtZiGvGuZiaiZiJuFWCaYg3aaZpeot3updqmJqKaKaHh6mny5iZismFd5lYdWm2aId5l3iJl4VnWHmFmJSmdpiIdXiluYmrqImZuYeGiWhoaZenmnuJlpaXl5qKWLmGiHeWuJlWepiXeItIh2aniZp5mIiIisqLyLimpouYeMd4doiJiKeoiGhqp3iYaneJaHh3iIeXmIp4qIurWMeYmHeEiJlqWqiWiYqJhaeWl3t4iKiFiIyMpNeplmypippXqIeXZ5h4h3p3WHaHSVibdYdpl3WHaXlZmnqWqKmnapp5qXmamHp5iHfJhpd5iIi4aIhouHuJiJiNeGqZiHlpm3d6iWiIyYeYmWh1m3hcTJqWiXmIp4inKnZ0yEiaaKRYemiWVrZ4hne4eJmoZ3aXiFSKtqqaunmpiqmImZl4ioh5aGlkqIaWSIh6eImmpneZp6p4ilqqm4mqiY16iyp3hZeJiUh5eImZd4l4l4l6WJd3iXhoeJiKeWiHh4d4hpmluIqpeJd3yMiMmpjJmKp3dXiXZ4mXpYd6d3WHtYiGiIh5epp7l8epeoy5rJ2JiHjKlqqIn6mJiZqJiZnIiKqZmIiIp5iHmZl6irmJmZmXmJiZyld2Z6ZoZmqId2aZh5NqZ5qpiJmEmamZeZWWeKaJeFh4aYjIqbeMp4eFuZy2eMjKaaqHiYh4lZpXmJmXiId5iHemh6mUmoulmZaHmbebx5qZaIU1eXqFeImZaYg5llaJeYtWZZaZhWqYpGh4Z4ZaiJmJh4iHWZWqaJiJl4eWiYWCmauYSlWVqDmLiZValpSIg4eYqpe5mZZphIiJqKt5hoiVh4mWqVqleXaFmqiauIeYZImZmLZ7dqdnhIipiYmZi0amqZp3loeJi3mnl5hop2iIlzZ5eIhHmplpeVmJdoi5h5RYloiVSJmYWZV0mUl0mXmYiZimlWRomEmZiJtpl2ineXh2mZuHmYpmSZeKiFiYdpqImVd7loN6iZmZVrmXaZuXiWlnloipmHpmd5lWeGa2WYmTmmyYeJi3map4yXmrtJd5hpmFqFmHhJdYqWhlqGd6qZqGdpqKKWZniIhIh2p4lkZaSHumeXtYhFuIaJmWaaiHmUemiFiZaZmHlWmYc5Z5iZe5mQg=');
const modelParams = [];
for (let i = 0; i < 0 + 1*encodedWeights.length; i++) {
    const a = encodedWeights.charCodeAt(i);
    modelParams.push(((a & 0xf) - 8) * 2.2 / 16, (((a >> 4) & 0xf) - 8) * 2.2 / 16);
}

function linearReluLayer(data, modelParams, numOutputs, numInputs, x0, y0, span, stride, weightOffset, biasOffset) {
    const outputs = new Array(numOutputs);
    for (let i = 0; i < numOutputs; i++) {
        let acc = 0;
        for (let j = 0; j < numInputs; j++) {
            const inputIndex = y0 + j % span + stride * (x0 + Math.floor(j / span));
            const weightIndex = weightOffset + i * numInputs + j;
            acc += modelParams[weightIndex] * data[inputIndex];
        }
        const biasIndex = i + biasOffset + weightOffset;
        outputs[i] = Math.max(0, modelParams[biasIndex] + acc);
    }
    return outputs
}

function classify(data) {
    const BASE_PATCH = 7 * 7;
    const PATCH_FEATURES = 14;
    const PATCH_FEATURES_DEEP = 16;
    const NUM_CLASSES = 13;

    // data, modelParams, numOutputs, numInputs, x0, y0, span, stride, weightOffset, biasOffset
    x11 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x12 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x13 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x14 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    x21 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x22 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x23 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x24 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    x31 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x32 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x33 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x34 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    x41 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x42 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x43 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x44 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    y11 = linearReluLayer(x11.concat(x12, x21, x22), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);
    y12 = linearReluLayer(x13.concat(x14, x23, x24), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);
    y21 = linearReluLayer(x31.concat(x32, x41, x42), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);
    y22 = linearReluLayer(x33.concat(x34, x43, x44), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);

    z = linearReluLayer(y11.concat(y12, y21, y22), modelParams, NUM_CLASSES, 4 * PATCH_FEATURES_DEEP,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES + 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP + PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES_DEEP * NUM_CLASSES);

    return z;
}

export {
    classify
}