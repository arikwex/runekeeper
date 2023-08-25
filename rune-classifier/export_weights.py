import math
import os
import base64
import torch
from PIL import Image
from torchvision import transforms
from main import Net

def get_quantized_encoding(model):
    model_params = list(model.parameters())
    def quantize_weights(w):
        w = w.reshape(-1)
        new_weights = torch.zeros(w.shape[0], dtype=torch.int8)
        QUANTIZATION = 16
        MAX_RANGE = 2.2
        for i in range(w.shape[0]):
            quantized_value = round(float(w[i]) * QUANTIZATION / MAX_RANGE + QUANTIZATION / 2)
            integer_weight = max(min(quantized_value, QUANTIZATION - 1), 0)
            new_weights[i] = integer_weight
        return new_weights.tolist()
    fc1_w = quantize_weights(model_params[0])
    fc1_b = quantize_weights(model_params[1])
    fc2_w = quantize_weights(model_params[2])
    fc2_b = quantize_weights(model_params[3])
    fc3_w = quantize_weights(model_params[4])
    fc3_b = quantize_weights(model_params[5])
    print(len(fc2_w))
    return fc1_w + fc1_b + fc2_w + fc2_b + fc3_w + fc3_b

def pack_bytes(input_array):
    result = []
    current_byte = 0
    shift = 0
    
    for value in input_array:
        packed_value = value << shift
        current_byte |= packed_value
        shift += 4
        
        if shift == 8:
            result.append(current_byte)
            current_byte = 0
            shift = 0
    
    if shift > 0:
        result.append(current_byte)
    
    return result

def run_model_raw(quantized_params, data):
    [fc1_w, fc1_b, fc2_w, fc2_b, fc3_w, fc3_b] = quantized_params
    img = data.view(28 * 28).tolist()
    
    def receptive_field(z, size, x0, y0, span, weight, bias):
        num_outputs = len(weight)
        num_inputs = len(weight[0])
        outputs = [0] * num_outputs
        for i in range(num_outputs):
            acc = 0
            for j in range(num_inputs):
                input_index = x0 + j % span + size * (y0 + math.floor(j / span))
                acc += weight[i][j] * z[input_index]
            outputs[i] = max(0, bias[i] + acc)
        return outputs
    
    x11 = receptive_field(img, 28, 0, 0, 7, fc1_w, fc1_b)
    x12 = receptive_field(img, 28, 7, 0, 7, fc1_w, fc1_b)
    x13 = receptive_field(img, 28, 14, 0, 7, fc1_w, fc1_b)
    x14 = receptive_field(img, 28, 21, 0, 7, fc1_w, fc1_b)
    
    x21 = receptive_field(img, 28, 0, 7, 7, fc1_w, fc1_b)
    x22 = receptive_field(img, 28, 7, 7, 7, fc1_w, fc1_b)
    x23 = receptive_field(img, 28, 14, 7, 7, fc1_w, fc1_b)
    x24 = receptive_field(img, 28, 21, 7, 7, fc1_w, fc1_b)
    
    x31 = receptive_field(img, 28, 0, 14, 7, fc1_w, fc1_b)
    x32 = receptive_field(img, 28, 7, 14, 7, fc1_w, fc1_b)
    x33 = receptive_field(img, 28, 14, 14, 7, fc1_w, fc1_b)
    x34 = receptive_field(img, 28, 21, 14, 7, fc1_w, fc1_b)
    
    x41 = receptive_field(img, 28, 0, 21, 7, fc1_w, fc1_b)
    x42 = receptive_field(img, 28, 7, 21, 7, fc1_w, fc1_b)
    x43 = receptive_field(img, 28, 14, 21, 7, fc1_w, fc1_b)
    x44 = receptive_field(img, 28, 21, 21, 7, fc1_w, fc1_b)
    
    y11 = receptive_field(x11 + x12 + x21 + x22, 0, 0, 0, 10000, fc2_w, fc2_b)
    y12 = receptive_field(x13 + x14 + x23 + x24, 0, 0, 0, 10000, fc2_w, fc2_b)
    y21 = receptive_field(x31 + x32 + x41 + x42, 0, 0, 0, 10000, fc2_w, fc2_b)
    y22 = receptive_field(x33 + x34 + x43 + x44, 0, 0, 0, 10000, fc2_w, fc2_b)
    
    z11 = receptive_field(y11 + y12 + y21 + y22, 0, 0, 0, 10000, fc3_w, fc3_b)
    
    # Softmax
    softmaxes = [0] * len(z11)
    total = 0
    for i in range(len(z11)):
        val = math.exp(z11[i])
        softmaxes[i] = val
        total += val
    for i in range(len(z11)):
        softmaxes[i] = math.log(softmaxes[i] / total)
    return torch.tensor(softmaxes)


def main():
    model = Net()
    model.load_state_dict(torch.load("model.pt", map_location=torch.device('cpu')))
    weights = get_quantized_encoding(model)
    packed_weights = pack_bytes(weights)
    base64_encoded = base64.b64encode(bytes(packed_weights)).decode('utf-8')
    print('Writing base 64 endocded parameters to file...')
    with open('base64_encoded_model.txt', 'w') as f:
        f.write(base64_encoded)
    
    # Test image
    # transform = transforms.Compose([ transforms.ToTensor() ])
    # image_path = "../rune-data/test/dragon/r_1.png"
    # image = Image.open(image_path).convert("L")
    # image = transform(image)
    # model.eval()
    # tx = torch.nn.functional.relu(model.fc2(image[:,0:7,21:28].reshape(49)))
    # _, tx = model(image.reshape(1, 1, 28, 28))
    # print(tx)
    # print(min(packed_weights))
    # print(max(packed_weights))
    # print(min(weights))
    # print(max(weights))

    
if __name__ == '__main__':
    main()