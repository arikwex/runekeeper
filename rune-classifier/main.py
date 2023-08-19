from __future__ import print_function
import argparse
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms
from torch.optim.lr_scheduler import StepLR


# class Net(nn.Module):
#     def __init__(self):
#         super(Net, self).__init__()
#         self.conv1 = nn.Conv2d(1, 16, 3, 1)
#         self.conv2 = nn.Conv2d(16, 16, 3, 1)
#         self.dropout1 = nn.Dropout(0.1)
#         self.dropout2 = nn.Dropout(0.1)
#         self.dropout3 = nn.Dropout(0.1)
#         self.fc1 = nn.Linear(144, 16)
#         self.fc2 = nn.Linear(16, 10)

#     def forward(self, x):
#         x = self.conv1(x)
#         x = F.relu(x)
#         x = F.max_pool2d(x, 2)
#         x = self.dropout1(x)
        
#         x = self.conv2(x)
#         x = F.relu(x)
#         x = F.max_pool2d(x, 3)
#         x = self.dropout2(x)
        
#         x = torch.flatten(x, 1)
#         x = self.fc1(x)
#         x = F.relu(x)
#         x = self.fc2(x)
#         x = F.relu(x)
#         output = F.log_softmax(x, dim=1)
#         return output

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.dropout1 = nn.Dropout(0.25)
        self.dropout2 = nn.Dropout(0.5)
        PATCH_FEATURES = 16
        PATCH_FEATURES_DEEP = 16
        OUTPUT_CLASSES = 10
        self.fc1 = nn.Linear(7*7, PATCH_FEATURES)
        self.fc2 = nn.Linear(PATCH_FEATURES * 4, PATCH_FEATURES_DEEP)
        self.fc3 = nn.Linear(PATCH_FEATURES_DEEP * 4, OUTPUT_CLASSES)

    def forward(self, x):
        x11 = self.fc1(x[:, 0, 0:7, 0:7].reshape(-1, 7 * 7))
        x12 = self.fc1(x[:, 0, 0:7, 7:14].reshape(-1, 7 * 7))
        x13 = self.fc1(x[:, 0, 0:7, 14:21].reshape(-1, 7 * 7))
        x14 = self.fc1(x[:, 0, 0:7, 21:28].reshape(-1, 7 * 7))
        x21 = self.fc1(x[:, 0, 7:14, 0:7].reshape(-1, 7 * 7))
        x22 = self.fc1(x[:, 0, 7:14, 7:14].reshape(-1, 7 * 7))
        x23 = self.fc1(x[:, 0, 7:14, 14:21].reshape(-1, 7 * 7))
        x24 = self.fc1(x[:, 0, 7:14, 21:28].reshape(-1, 7 * 7))
        x31 = self.fc1(x[:, 0, 14:21, 0:7].reshape(-1, 7 * 7))
        x32 = self.fc1(x[:, 0, 14:21, 7:14].reshape(-1, 7 * 7))
        x33 = self.fc1(x[:, 0, 14:21, 14:21].reshape(-1, 7 * 7))
        x34 = self.fc1(x[:, 0, 14:21, 21:28].reshape(-1, 7 * 7))
        x41 = self.fc1(x[:, 0, 21:28, 0:7].reshape(-1, 7 * 7))
        x42 = self.fc1(x[:, 0, 21:28, 7:14].reshape(-1, 7 * 7))
        x43 = self.fc1(x[:, 0, 21:28, 14:21].reshape(-1, 7 * 7))
        x44 = self.fc1(x[:, 0, 21:28, 21:28].reshape(-1, 7 * 7))
        
        y11 = self.fc2(self.dropout1(torch.cat((x11, x12, x21, x22), dim=1)))
        y12 = self.fc2(self.dropout1(torch.cat((x13, x14, x23, x24), dim=1)))
        y21 = self.fc2(self.dropout1(torch.cat((x31, x32, x41, x42), dim=1)))
        y22 = self.fc2(self.dropout1(torch.cat((x33, x34, x43, x44), dim=1)))
        
        z = self.fc3(self.dropout2(F.relu(torch.cat((y11, y12, y21, y22), dim=1))))
        # z = F.relu(z)
        output = F.log_softmax(z, dim=1)
        return output


def train(args, model, device, train_loader, optimizer, epoch):
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        loss = F.nll_loss(output, target)
        # loss = F.mse_loss(output, target)
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
        for data, target in test_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            test_loss += F.nll_loss(output, target, reduction='sum').item()  # sum up batch loss
            pred = output.argmax(dim=1, keepdim=True)  # get the index of the max log-probability
            correct += pred.eq(target.view_as(pred)).sum().item()

    test_loss /= len(test_loader.dataset)

    print('\nTest set: Average loss: {:.4f}, Accuracy: {}/{} ({:.0f}%)\n'.format(
        test_loss, correct, len(test_loader.dataset),
        100. * correct / len(test_loader.dataset)))


def main():
    # Training settings
    parser = argparse.ArgumentParser(description='PyTorch MNIST Example')
    parser.add_argument('--batch-size', type=int, default=200, metavar='N')
    parser.add_argument('--test-batch-size', type=int, default=1000, metavar='N',
                        help='input batch size for testing (default: 1000)')
    parser.add_argument('--epochs', type=int, default=100, metavar='N',
                        help='number of epochs to train (default: 100)')
    parser.add_argument('--lr', type=float, default=1.0, metavar='LR',
                        help='learning rate (default: 1.0)')
    parser.add_argument('--gamma', type=float, default=0.7, metavar='M',
                        help='Learning rate step gamma (default: 0.7)')
    parser.add_argument('--no-cuda', action='store_true', default=False,
                        help='disables CUDA training')
    parser.add_argument('--no-mps', action='store_true', default=False,
                        help='disables macOS GPU training')
    parser.add_argument('--dry-run', action='store_true', default=False,
                        help='quickly check a single pass')
    parser.add_argument('--seed', type=int, default=1, metavar='S',
                        help='random seed (default: 1)')
    parser.add_argument('--log-interval', type=int, default=10, metavar='N',
                        help='how many batches to wait before logging training status')
    parser.add_argument('--save-model', action='store_true', default=False,
                        help='For Saving the current Model')
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
        cuda_kwargs = {'num_workers': 1,
                       'pin_memory': True,
                       'shuffle': True}
        train_kwargs.update(cuda_kwargs)
        test_kwargs.update(cuda_kwargs)

    transform=transforms.Compose([
        transforms.ToTensor(),
        # transforms.Normalize((0.1307,), (0.3081,))
        ])
    dataset1 = datasets.MNIST('../data', train=True, download=True,
                       transform=transform)
    dataset2 = datasets.MNIST('../data', train=False,
                       transform=transform)
    train_loader = torch.utils.data.DataLoader(dataset1,**train_kwargs)
    test_loader = torch.utils.data.DataLoader(dataset2, **test_kwargs)

    model = Net().to(device)
    
    # Count the total number of weights and bias parameters
    total_params = sum(p.numel() for p in model.parameters())
    total_weights = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_biases = total_params - total_weights
    print(f"Total parameters: {total_params}")
    print(f"Total weights: {total_weights}")
    print(f"Total biases: {total_biases}")
    
    optimizer = optim.Adadelta(model.parameters(), lr=args.lr)

    scheduler = StepLR(optimizer, step_size=1, gamma=args.gamma)
    for epoch in range(1, args.epochs + 1):
        train(args, model, device, train_loader, optimizer, epoch)
        test(model, device, test_loader)
        torch.save(model.state_dict(), "model.pt")
        scheduler.step()

    # if args.save_model:
    # torch.save(model.state_dict(), "model.pt")

if __name__ == '__main__':
    main()