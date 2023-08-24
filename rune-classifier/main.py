from __future__ import print_function
import argparse
import math
import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision import datasets, transforms
from torch.optim.lr_scheduler import StepLR

# normalized_tensor = F.layer_norm(input_tensor, normalized_shape=input_tensor.size()[1:], weight=None, bias=None, eps=epsilon)
def M(t):
    # t += torch.randn(t.shape).to(t.device) * 1.0
    # t = F.layer_norm(t, normalized_shape=t.size()[1:], weight=None, bias=None, eps=1e-3)
    t = F.leaky_relu(t)
    # t = F.tanh(t)
    return t

def W(t):
    # t += torch.randn(t.shape).to(t.device) * 1.0
    # t = F.layer_norm(t, normalized_shape=t.size()[1:], weight=None, bias=None, eps=1e-3)
    t = F.leaky_relu(t)
    # t = F.tanh(t)
    return t

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.dropout1 = nn.Dropout(0.05)
        self.dropout2 = nn.Dropout(0.15)
        PATCH_FEATURES = 30
        PATCH_FEATURES_DEEP = 24
        OUTPUT_CLASSES = 13
        self.fc1 = nn.Linear(7*7, PATCH_FEATURES, bias=True)
        self.fc2 = nn.Linear(PATCH_FEATURES * 4, PATCH_FEATURES_DEEP, bias=True)
        self.fc3 = nn.Linear(PATCH_FEATURES_DEEP * 4, OUTPUT_CLASSES, bias=True)

    def forward(self, x):
        x11 = W(self.fc1(x[:, 0, 0:7, 0:7].reshape(-1, 7 * 7)))
        x12 = W(self.fc1(x[:, 0, 0:7, 7:14].reshape(-1, 7 * 7)))
        x13 = W(self.fc1(x[:, 0, 0:7, 14:21].reshape(-1, 7 * 7)))
        x14 = W(self.fc1(x[:, 0, 0:7, 21:28].reshape(-1, 7 * 7)))
        x21 = W(self.fc1(x[:, 0, 7:14, 0:7].reshape(-1, 7 * 7)))
        x22 = W(self.fc1(x[:, 0, 7:14, 7:14].reshape(-1, 7 * 7)))
        x23 = W(self.fc1(x[:, 0, 7:14, 14:21].reshape(-1, 7 * 7)))
        x24 = W(self.fc1(x[:, 0, 7:14, 21:28].reshape(-1, 7 * 7)))
        x31 = W(self.fc1(x[:, 0, 14:21, 0:7].reshape(-1, 7 * 7)))
        x32 = W(self.fc1(x[:, 0, 14:21, 7:14].reshape(-1, 7 * 7)))
        x33 = W(self.fc1(x[:, 0, 14:21, 14:21].reshape(-1, 7 * 7)))
        x34 = W(self.fc1(x[:, 0, 14:21, 21:28].reshape(-1, 7 * 7)))
        x41 = W(self.fc1(x[:, 0, 21:28, 0:7].reshape(-1, 7 * 7)))
        x42 = W(self.fc1(x[:, 0, 21:28, 7:14].reshape(-1, 7 * 7)))
        x43 = W(self.fc1(x[:, 0, 21:28, 14:21].reshape(-1, 7 * 7)))
        x44 = W(self.fc1(x[:, 0, 21:28, 21:28].reshape(-1, 7 * 7)))
        
        y11 = M(self.fc2(self.dropout1(torch.cat((x11, x12, x21, x22), dim=1))))
        y12 = M(self.fc2(self.dropout1(torch.cat((x13, x14, x23, x24), dim=1))))
        y21 = M(self.fc2(self.dropout1(torch.cat((x31, x32, x41, x42), dim=1))))
        y22 = M(self.fc2(self.dropout1(torch.cat((x33, x34, x43, x44), dim=1))))
        
        z = F.sigmoid(self.fc3(self.dropout2(torch.cat((y11, y12, y21, y22), dim=1))))
        # z = M(self.fc3(self.dropout2(torch.cat((y11, y12, y21, y22), dim=1))))
        # output = F.softmax(z, dim=1)
        return z #output

def train(args, model, device, train_loader, optimizer, epoch):
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        # loss = F.mse_loss(output, F.one_hot(target, num_classes=13).to(torch.float32))
        loss = F.binary_cross_entropy(output, F.one_hot(target, num_classes=13).to(torch.float32))
        # loss = F.nll_loss(output, target)
        loss.backward()
        optimizer.step()
        if batch_idx % args.log_interval == 0:
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch, batch_idx * len(data), len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.item()))
            if args.dry_run:
                break


def test(model, device, test_loader):
    model.eval()
    test_loss = 0
    correct = 0
    with torch.no_grad():
        misclassified_counts = {}
        for data, target in test_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            # test_loss += F.nll_loss(output, target, reduction='sum').item()  # sum up batch loss
            test_loss += F.mse_loss(output, F.one_hot(target, num_classes=13).to(torch.float32))
            pred = output.argmax(dim=1, keepdim=True)  # get the index of the max log-probability
            correct += pred.eq(target.view_as(pred)).sum().item()

            for i in range(len(target)):
                if pred[i] != target[i]:
                    misclass_label = target[i].item()
                    if misclass_label not in misclassified_counts:
                        misclassified_counts[misclass_label] = 1
                    else:
                        misclassified_counts[misclass_label] += 1

        # Print the misclassified counts for each class
        for class_label, count in misclassified_counts.items():
            print(f"[{reverse_class_mapping[class_label]}] misclassified {count} times")

    test_loss /= len(test_loader.dataset)

    print('\nTest set: Average loss: {:.4f}, Accuracy: {}/{} ({:.0f}%)\n'.format(
        test_loss, correct, len(test_loader.dataset),
        100. * correct / len(test_loader.dataset)))

def test_raw(model, test_loader):
    model.eval()
    correct = 0
    count = 0
    quantized_params = get_quantized_params(model)
    for data, target in test_loader:
        for i in range(data.shape[0]):
            output = run_model_raw(quantized_params, data[i])
            pred = output.argmax(keepdim=True)
            correct += pred.eq(target[i].view_as(pred)).sum().item()
            count += 1
            if count % 1000 == 0:
                print(f'...{count}')

    print('Raw Test set: Accuracy: {}/{} ({:.0f}%)\n'.format(
        correct, len(test_loader.dataset),
        100. * correct / len(test_loader.dataset)))

def get_quantized_params(model):
    model_params = list(model.parameters())
    def quantize_weights(w):
        original_dim = w.shape
        w = w.reshape(-1)
        new_weights = torch.zeros(w.shape[0])
        QUANTIZATION = 16
        MAX_RANGE = 2.2
        for i in range(w.shape[0]):
            quantized_value = round(float(w[i]) * QUANTIZATION / MAX_RANGE + QUANTIZATION / 2)
            integer_weight = max(min(quantized_value, QUANTIZATION - 1), 0)
            new_weights[i] = (integer_weight - QUANTIZATION / 2.0) * MAX_RANGE / QUANTIZATION
        return new_weights.reshape(original_dim).tolist()
    fc1_w = quantize_weights(model_params[0])
    fc1_b = quantize_weights(model_params[1])
    fc2_w = quantize_weights(model_params[2])
    fc2_b = quantize_weights(model_params[3])
    fc3_w = quantize_weights(model_params[4])
    fc3_b = quantize_weights(model_params[5])
    return [fc1_w, fc1_b, fc2_w, fc2_b, fc3_w, fc3_b]

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

class_mapping = {
    'garbage': 0,
    'fireball': 1,
    'meteor': 2,
    'dragon': 3,
    'ice': 4,
    'frost': 5,
    'hail': 6,
    'lightning': 7,
    'tornado': 8,
    'windwalk': 9,
    'transfusion': 10,
    'vine': 11,
    'shockwave': 12,
}
reverse_class_mapping = { v: k for k, v in class_mapping.items() }

class RuneDataset(Dataset):
    def __init__(self, root_dir, transform):
        self.root_dir = root_dir
        self.transform = transform
        self.categories = os.listdir(self.root_dir)
        self.all_data = []
        for category in self.categories:
            category_path = os.path.join(self.root_dir, category)
            for file_name in os.listdir(category_path):
                image_path = os.path.join(category_path, file_name)
                image = Image.open(image_path).convert("L")
                self.all_data.append({
                    'image': image,
                    'category': class_mapping[category]
                })

    def __len__(self):
        return len(self.all_data)

    def __getitem__(self, idx):
        data = self.all_data[idx]
        return (self.transform(data['image']), data['category'], )

def main():
    # Training settings
    parser = argparse.ArgumentParser(description='PyTorch MNIST Example')
    parser.add_argument('--batch-size', type=int, default=200, metavar='N')
    parser.add_argument('--test-batch-size', type=int, default=1000, metavar='N')
    parser.add_argument('--epochs', type=int, default=20, metavar='N')
    parser.add_argument('--lr', type=float, default=1.0, metavar='LR')
    parser.add_argument('--gamma', type=float, default=0.7, metavar='M')
    parser.add_argument('--no-cuda', action='store_true', default=False)
    parser.add_argument('--no-mps', action='store_true', default=False)
    parser.add_argument('--dry-run', action='store_true', default=False)
    parser.add_argument('--seed', type=int, default=1, metavar='S')
    parser.add_argument('--log-interval', type=int, default=10, metavar='N')
    parser.add_argument('--save-model', action='store_true', default=False)
    args = parser.parse_args()
    use_cuda = not args.no_cuda and torch.cuda.is_available()
    use_mps = not args.no_mps and torch.backends.mps.is_available()

    torch.manual_seed(args.seed)
    if use_cuda:
        device = torch.device("cuda")
    elif use_mps:
        device = torch.device("mps")
    else:
        device = torch.device("cpu")

    train_kwargs = {'batch_size': args.batch_size}
    test_kwargs = {'batch_size': args.test_batch_size}
    if use_cuda:
        cuda_kwargs = {'num_workers': 8, 'pin_memory': True, 'shuffle': True}
        train_kwargs.update(cuda_kwargs)
        test_kwargs.update(cuda_kwargs)
    
    # Define transformations
    transform = transforms.Compose([
        transforms.ToTensor(),
        # transforms.RandomRotation(degrees=(-20, 20))
        transforms.RandomAffine(
            degrees=(-15, 15),
            translate=(0.05, 0.05),
            scale=(0.9, 1.1),
            interpolation=transforms.InterpolationMode.BILINEAR
        )
    ])
    train_dataset = RuneDataset(root_dir='../rune-data/train', transform=transform)
    test_dataset = RuneDataset(root_dir='../rune-data/test', transform=transform)
    train_loader = DataLoader(train_dataset, **train_kwargs)
    test_loader = DataLoader(test_dataset, **train_kwargs)

    model = Net().to(device)
    
    # Count the total number of weights and bias parameters
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Total parameters: {total_params}")
    optimizer = optim.Adadelta(model.parameters(), lr=args.lr)

    scheduler = StepLR(optimizer, step_size=1, gamma=args.gamma)
    for epoch in range(1, args.epochs + 1):
        train(args, model, device, train_loader, optimizer, epoch)
        test(model, device, test_loader)
        torch.save(model.state_dict(), "model.pt")
        scheduler.step()
    
    test_raw(model, test_loader)

if __name__ == '__main__':
    main()